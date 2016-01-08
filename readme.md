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
```
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
