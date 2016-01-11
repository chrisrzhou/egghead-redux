import React from 'react';
import ReactDOM from 'react-dom';
import {createStore, combineReducers} from 'redux';
import {Provider, connect} from 'react-redux';

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


// Action Creators
let nextTodoId = 0;
const addTodo = (text) => {
  return {
    type: 'ADD_TODO',
    id: nextTodoId++,
    text,
  };
};

const toggleTodo = (id) => {
  return {
    type: 'TOGGLE_TODO',
    id,
  };
};

const setVisibilityFilter = (filter) => {
  return {
    type: 'SET_VISIBILITY_FILTER',
    filter,
  };
};

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

const mapStateToLinkProps = (
  state,
  ownProps,
) => {
  return {
    active: 
      ownProps.filter === state.visibilityFilter
  };
};

const mapDispatchToLinkProps = (
  dispatch,
  ownProps,
) => {
  return {
    onClick: () => {
      dispatch(setVisibilityFilter(ownProps.filter));
    }
  };
};

const FilterLink = connect(
  mapStateToLinkProps,
  mapDispatchToLinkProps,
)(Link);

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

// maps redux store state to components
const mapStateToTodoListProps = (state) => {
  return {
    todos: getVisibleTodos(
      state.todos,
      state.visibilityFilter,
    )
  };
};

// maps redux store dispatch to list of components
const mapDispatchToTodoListProps = (dispatch) => {
  return {
    onTodoClick: id => {
      dispatch(toggleTodo(id));
    },
  };
};

const VisibleTodoList = connect(
  mapStateToTodoListProps,
  mapDispatchToTodoListProps,
)(TodoList);

/**
 * Manual implementation to subscribe, unsubscribe, dispatching to redux store,
 * and using store context.
 * contrasted to using connect in react-redux library as shown above
 */
// class VisibleTodoList extends Component {
//   componentDidMount() {
//     const {store} = this.context;
//     this.unsubscribe = store.subscribe(() =>
//       this.forceUpdate()
//     );
//   }
// 
//   componentWillUnmount() {
//     this.unsubscribe();
//   }
// 
//   render() {
//     const props = this.props;
//     const {store} = this.context;
//     const state = store.getState();
// 
//     return (
//       <TodoList
//         todos={
//           getVisibleTodos(
//             state.todos,
//             state.visibilityFilter,
//           )
//         }
//         onTodoClick={id =>
//           store.dispatch({
//             type: 'TOGGLE_TODO',
//             id,
//           })
//         }
//       />
//     );
//   }
// }
// VisibleTodoList.contextTypes = {
//   store: React.PropTypes.object,
// };

let AddTodo = ({dispatch}) => {
  let input;
  return (
    <div>
      <input ref={node => {input = node;}} />
      <button onClick={() => {
        dispatch(addTodo(input.value));
        input.value = '';
      }}>
        Add Todo
      </button>
    </div>
  );
};
AddTodo = connect()(AddTodo);
// the above statement is similar to
// AddTodo = connect(
//   state => {
//     return {};
//   },
//   dispatch => {
//     return {dispatch};
//   }
// )(AddTodo);

const Footer = ({store}) => (
  <p>
    Show:
    {' '}
    <FilterLink
      filter='SHOW_ALL'>
      All
    </FilterLink>
    {' '}
    <FilterLink
      filter='SHOW_ACTIVE'>
      Active
    </FilterLink>
    {' '}
    <FilterLink 
      filter='SHOW_COMPLETED'>
      Completed
    </FilterLink>
  </p>
);

const TodoApp = () => {
  return (
    <div>
      <AddTodo />
      <VisibleTodoList />
      <Footer />
    </div>
  );
}

/**
 * Manual implementation of Provider
 */
// class Provider extends Component {
//   // react special method to set context on this props to all children
//   getChildContext() {
//     return {
//       store: this.props.store
//     };
//   }
//   render() {
//     return this.props.children;
//   }
// }
// Provider.childContextTypes = {
//   store: PropTypes.object,
// };
// 
 ReactDOM.render(
   <Provider store={createStore(todoApp)}>
     <TodoApp />
   </Provider>,
   document.getElementById('todo')
 );
