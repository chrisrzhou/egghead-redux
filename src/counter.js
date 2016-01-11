import {createStore} from 'redux';
import React from 'react';
import ReactDOM from 'react-dom';

const counter = function(state=0, action) {
  switch(action.type) {
    case 'INCREMENT':
      return state + 1;
    case 'DECREMENT':
      return state - 1;
    default:
      return state;
  }
}

const Counter = ({
  value,
  onIncrement,
  onDecrement,
}) => (
  <div>
    <h1>{value}</h1>
    <button onClick={onDecrement}>-</button>
    <button onClick={onIncrement}>+</button>
  </div>
);

/**
 * Manual implementation of createStore
 */
// const createStore = (reducer) => {
//   let state;
//   let listeners = [];
//   const getState = () => state;
//   const dispatch = (action) => {
//     state = reducer(action, state);
//     listeners.forEach(listener => listener());
//   };
//   const subscribe = (listener) => {
//     listeners.push(listener);
//     return () => {
//       listeners = listeners.filter(l => l !== listener);
//     };
//   };
//   dispatch({});
//   return {getState, dispatch, subscribe}
// };
const store = createStore(counter);
const render = () => {
  ReactDOM.render(
    <Counter
      value={store.getState()}
      onIncrement={() =>
        store.dispatch({
          type: 'INCREMENT',
        })
      }
      onDecrement={() =>
        store.dispatch({
          type: 'DECREMENT',
        })
      }
    />,
    document.getElementById('counter')
  );
};

store.subscribe(render);
render();
