# Redux Notes
Redux notes taken from [Egghead Redux series](https://egghead.io/series/getting-started-with-redux) by Dan Abramov

## The Immutable State Tree and Actions
The state tree is a **redundant javascript object** that holds data of the
current state of the app.  You **cannot** read and write to the state.

We create new states through actions, which are represented as
**plain Javascript objects**.

*Just as the state is the minimal representation of the data in the app, the
actions are the minimal representation of the change to the data.*

Action requires a `type` property that should be a string description of the
action. Components are invisible to what actions are doing.  They are only
responsible for dispatching actions with the right attributes.

## Pure and Impure Functions
Pure functions are functions whose return values depend **solely** on the values
of their arguments.  They do not have observable side effects, such as network
or database calls.  They do not mutate the arguments passed to them.
They are predictable.

Impure functions are the opposite of what is described above for pure functions.
In Redux, functions need to be pure.

## Reducer Function
In Redux, the state mutation in your app must be described as a pure function,
that takes the previous state and action being dispatched and returns the next
state of your application.  This single function is the `reducer`.

## Redux Store
The Redux store is an object with 3 important functions:
- `getState`
- `dispatch`
- `subscribe`

The implementation of the Redux store is very simple and looks very similar to:

```js
const createStore = (reducer) => {
  let state;
  let listeners = [];

  const getState = () => state;
  const dispatch = (action) => {
    state = reducer(state, action);  // update state using reducer
    listeners.forEach(listener => listener());  // run each listener
  };
  const subscribe = (listener) => {
    listeners.push(listener);
    return () => {  // simple manual unsubscribe function
        listeners = listeners.filter(l => l !== listener);
    }
  };
  dispatch({});  // initiate store with dummy action
  return { getState, dispatch, subscribe }
}
```

## Avoid Array Mutations
Recall that in Redux, we want to avoid mutating arrays and state.  Typically
when working with arrays, we tend to use `push` and `splice`, but these mutate
the original array (as you can check with the `deepFreeze` library).

Instead, we should use `concat`, `slice`, `map` and the spread operator
in ES6 `...` to accomplish these array mutations.

To avoid object mutations, we should use `Object.assign()` in ES5 and the
spread operator `...` in ES6.

```js
// Add an item
list.push(0);  // mutations
list.concat([0]);  // no mutations
[...list, 0];  // no mutations (ES6)

// Delete an item
list.splice(index, 1);  // mutations
list.slice(0, index).concat(list.slice(index + 1));  // no mutations
[...list.slice(0, index), ...list.slice(index + 1)];  // no mutations (ES6)

// Increment item
list[index]++;  // mutations
```

## Avoid Object Mutations
To avoid object mutations, we should use `Object.assign()` in ES6 and the spread
operator in ES7 `...`


```js
// mutations
const toggleTodo = (todo) => {
  todo.completed = !todo.completed;
  return todo;
};

// no mutations (explicitly return object)
const toggleTodo = (todo) => {
  return {
    completed: !todo.completed,
    ...  // difficult to remember all other attributes for the object
  };
};

// no mutations (ES6 Object.assign operator)
// first arg is object to be changed, therefore pass it a default empty object
// second arg is object that is copied from
const toggleTodo = (todo) => {
  return Object.assign({}, todo, {
    completed: !todo.completed,
  });
};

// no mutations (ES7 ... operator)
const toggleTodo = (todo) => {
  return {
    ...todo,
    completed: !todo.completed,
  };
};
```

## Reducer Composition
As an application/reducer becomes more complicated, it maybe good to modularize
the reducer.  Since a reducer is a Javscript function, they can call each other
and we can use this pattern to compose reducers leading up to a main reducer
that is required for Redux.

It is good to separate reducers based on how parts of the state tree should be
operated on by actions.  E.g. for a TODO app, we should have a reducer `todo`
that operates on a single TODO item, and have another reducer `todos` that
operates on how list of TODO items should be updated by actions.

It is also a general pattern to compose an object of reducers for a combined
state object that is being returned.  This scales and is modular, allowing
developers to build new features to the state tree without influencing
existing attributes in the state tree. For example,

```js
// Current state tree consisting of array of todos
const todos = (state, action) => {...};

// To add a visibilityFilter to the state tree
const visibilityFilter = (state, action) => {...};
const todoApp = (state={}, action) => {  // initiate empty state object
  return {  // note that first value returned will be {todos: undefined, visibilityFilter: undefined}
    todos: todos(state.todos, action),  // existing todos
    visibilityFilter: visibilityFilter(state.visibilityFilter, action),
  };
};
```

## Presentational Components and Container Components
By best practices, React components should be statements and do not implement
behaviors and effects.  Such components are called *presentational components*.
They should just take props and render what props they are given.
For child components, this means passing functions as callbacks
instead of implementing functions within them.

A higher level component that contains the **data and behavior** is called a
*container component*, and that is where actions and callbacks are defined
and passed to presentational components.

Presentation components are good because it provides separation of concern
for rendering and handling app logic.  This allows you to keep your presentation
components if you choose to switch out Redux for another framework e.g. Relay.
But it could present quite a lot of extra work and boilerplate since more props
have to be passed down to leave components form the container component.

We should also use the functional style of writing stateless components
as in React v0.14+.  These components are pure functions of their props.
They are stateless and do not have lifecycle methods (e.g. `componentDidMount`,
`componentWillMount`, `render`), as compared to their `extends React.Component`
class-based components.

```js
// presentation component
const Todo = ({
  onClick,
  completed,
  text,
}) => (
  <li onClick={onClick}> completed={completed}>
    {text}
  </li>
);

// presentation component
const TodoList = ({
  todos,
  onTodoClick,
}) => (
  <ul>
    {todos.map(todo =>
      <Todo
        key={todo.id}
        {...todo}
        onClick={() => onTodoClick(todo.id)}
      />
    )}
  </ul>
);

// container component
class TodoApp extends Component {
  render() {
    return (
      ...
      <TodoList
        todos={visibleTodos}
        onTodoClick={id =>
          store.dispatch({
            type: 'TOGGLE_TODO',
            id,
          })
        }
      />
      ...
    );
  }
}

```

## React Provider
To help avoid overwriting boilerplate and passing `store` down explicitly via
`props`, we can pass it down implicitly via `context`.  To do this, we simply
need to write a provider class with a special React method `getChildContext`
and apply the following in container components that depend on stores.

All components that wish to register to the `context` store will simply opt in
by setting.

```js
// provider
class Provider extends Component {
  getChildContext() {
    retun {
      store: this.props.store,
    };
  }
  render() {
    return this.props.children;
  }
}
// this is required to make sure component receives context
Provider.childContextTypes = {
  store: React.PropTypes.object,
};

// render childs under Provider and initiate store in Provider
ReactDOM.render(
  <Provider store={createStore(todoApp)}>
    <TodoApp />
  </Provider>,
  document.getElementbyId('root')
);

// container component example
class FilterLink extends Component {
  componentDidMount() {
    const {store} = this.context;
    this.unsubscribe = store.subscribe(() =>
      this.forceUpdate();
    );
  }
  componentWillUnmount() {
    this.unsubscribe();
  }
  render() {
    const props = this.props;
    const {store} = this.context;
    const state = store.getState();

    return() {
      ...
    }
  }
}
// mandatory to register and receive store from context
FilterLink.contextTypes = {
  store: React.PropTypes.object,
};
```

**WARNING:**
`context` acts like a global variable that transmits data across components.
It's not a good practice to do this in general so use it sparingly.  The API
is also not very stable so things may change.

## React Redux
This is utility library that helps greatly reduce the amount of boilerplate
required when writing `Provider` and container components that connect to the
store.

It also contains the highly useful method `connect` that helps connect
store state and dispatch action to the container component.  All we have to do
is to define two functions to pass to the `connect` function, which will help
create the container component.

```js
const mapStateToProps = (state, props) => {
  return {
    propName1: ...,
    propName2: ...,
    ...
  };
}
const mapDispatchToProps = (dispatch, props) => {
  return {
    propName1: ...,
    propName2: ...,
    ...
  };
}
const ContainerComponent1 = connect(
  mapStateToProps,
  mapDispatchToProps,
)(PresentationalComponent1);
```
