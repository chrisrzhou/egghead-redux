import React from 'react';
import ReactDOM from 'react-dom';
import {createStore, combineReducers} from 'redux';
const {Component} = React;

// Reducer composition pattern
const todo = (state={}, action) => {  // state refers to individual todo
  switch(action.type) {
    case 'ADD_TODO':
      return {
        id: action.id,
        text: action.text,
        completed: false,
      }
    case 'TOGGLE_TODO':
      if (state.id !== action.id) {
        return state;
      }
      return {
        ...state,
        completed: !state.completed,
      };
    default:
      return state;
  }
};

export const todos = (state=[], action) => {  // state refers to array of todos
  switch(action.type) {
    case 'ADD_TODO': // ES6 array array concat
      return [...state, todo(undefined, action)];
    case 'TOGGLE_TODO': // array.map returns a new array
      return state.map(t => todo(t, action));
    case 'REMOVE_TODO':
      return [];
    default:
      return state;
  }
};

const visibilityFilter = (state='SHOW_ALL', action) => {
  switch (action.type) {
    case 'SET_VISIBILITY_FILTER':
      return action.filter;
    default:
      return state;
  }
};

/**
 * Manual implementation of todoApp + combineReducer
 */
// const todoApp = (state={}, action) => {
//   // first return value will be {todos: undefined, visibilityFilter: undefined}
//   return {
//     todos: todos(
//       state.todos,
//       action,
//     ),
//     visibilityFilter: visibilityFilter(
//       state.visibilityFilter,
//       action,
//     )
//   };
// };

/**
 * Manual implementation of combineReducer
 */
// const combineReducers = (reducers) => {
//   return (state={}, action) => {
//     return Object.keys(reducers).reduce(  // use reduce function
//       (nextState, key) => {
//         nextState[key] = reducers[key](
//           state[key],
//           action,
//         );
//         return nextState;
//       },
//       {},  // start with empty object
//     );
//   };
// };
const todoApp = combineReducers({
  todos,
  visibilityFilter,
});
export const store = createStore(todoApp);

const Link = ({
  active,
  children,
  onClick,
}) => {
  if (active) {
    return <span>{children}</span>;
  }
  return (
    <a href='#'
      onClick={e => {
        e.preventDefault();
        onClick();
      }}>
      {children}
    </a>
  );
};

class FilterLink extends Component {
  componentDidMount() {
    const {store} = this.props;
    this.unsubscribe = store.subscribe(() =>
      this.forceUpdate()
    );
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  render() {
    const props = this.props;
    const {store} = props;
    const state = store.getState();

    return (
      <Link
        active={props.filter === state.visibilityFilter}
        onClick={() =>
          store.dispatch({
            type: 'SET_VISIBILITY_FILTER',
            filter: props.filter,
          })
        }>
        {props.children}
      </Link>
    );
  }
}

const getVisibleTodos = (
  todos,
  filter,
) => {
  switch (filter) {
    case 'SHOW_ALL':
      return todos;
    case 'SHOW_COMPLETED': 
      return todos.filter(t => t.completed);
    case 'SHOW_ACTIVE':
      return todos.filter(t => !t.completed);
    default:
      return todos;
  }
}

// make this a presentational component.  It doesn't specify behavior, and
// simply takes props.
const Todo = ({
  onClick,
  completed,
  text,
}) => (
  <li
    onClick={onClick}
    style={{
      textDecoration:
        completed ?
          'line-through' :
          'none'
    }}>
    {text}
  </li>
);

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

class VisibleTodoList extends Component {
  componentDidMount() {
    const {store} = this.props;
    this.unsubscribe = store.subscribe(() =>
      this.forceUpdate()
    );
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  render() {
    const props = this.props;
    const {store} = props;
    const state = store.getState();

    return (
      <TodoList
        todos={
          getVisibleTodos(
            state.todos,
            state.visibilityFilter,
          )
        }
        onTodoClick={id =>
          store.dispatch({
            type: 'TOGGLE_TODO',
            id,
          })
        }
      />
    );
  }
}

const AddTodo = ({store}) => {
  let input;
  return (
    <div>
      <input ref={node => {input = node;}} />
      <button onClick={() => {
        store.dispatch({
          type: 'ADD_TODO',
          id: nextTodoId++,
          text: input.value
        });
        input.value = '';
      }}>
        Add Todo
      </button>
    </div>
  );
};

const Footer = ({store}) => (
  <p>
    Show:
    {' '}
    <FilterLink
      store={store}
      filter='SHOW_ALL'>
      All
    </FilterLink>
    {' '}
    <FilterLink
      store={store}
      filter='SHOW_ACTIVE'>
      Active
    </FilterLink>
    {' '}
    <FilterLink 
      store={store}
      filter='SHOW_COMPLETED'>
      Completed
    </FilterLink>
  </p>
);

let nextTodoId = 0;
const TodoApp = ({store}) => {
  return (
    <div>
      <AddTodo store={store}/>
      <VisibleTodoList store={store}/>
      <Footer store={store}/>
    </div>
  );
}

ReactDOM.render(
  <TodoApp store={createStore(todoApp)} />,
  document.getElementById('todo')
);
