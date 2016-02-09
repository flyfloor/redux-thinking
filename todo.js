// createStore receive reducer, and built state tree

/*
1. getState: get state
2. dispatch: get action, let listener to create new state
3. subscribe: subscribe listener
*/

const createStore = (reducer) => {
    let state;
    let listeners = [];
    
    const getState = () => { return state; };

    const dispatch = (action) => { 
        state = reducer(state, action);
        listeners.map(listener => listener());
    };

    const subscribe = (listener) => {
        listeners.push(listener);
        // unsubscribe listener
        return () => {
            listeners = listeners.filter(l => l !== listener);
        };
    }
    dispatch({});

    return { dispatch, getState, subscribe };
};


// reducer receive state and action, create new state

const toggleTodoReducer = (state, action) => {
    if (state.id !== action.id) return state;
    return {
        ...state,
        completed: !state.completed,
    };
}

const AddTodoReducer = (state, action) => {
    return {
        id: action.id,
        text: action.text,
        completed: false,
    };
}

const todosReducer = (state = [], action) => {
    switch (action.type) {
        case 'ADD_TODO':
            return [
                ...state,
                AddTodoReducer(undefined, action)
            ];
        case 'TOGGLE_TODO':
            return state.map(todo => toggleTodoReducer(todo, action))
        default:
            return state;
    }
};

const displayFilterReducer = (state ='ALL', action) => {
    switch(action.type){
        case 'SET_DISPLAY_FILTER':
            return action.filter;
        default:
            return state;
    }
}


const todoAppReducer = (state = {}, action) => {
    return {
        todos: todosReducer(state.todos, action),
        displayFilter: displayFilterReducer(state.displayFilter, action)
    }
}

const store = createStore(todoAppReducer)

store.dispatch(
  {
    id: 1,
    text: 'first todo', 
    type: 'ADD_TODO'
  },)
  
store.dispatch({
    id: 2,
    text: 'second todo', 
    type: 'ADD_TODO'
 })


store.dispatch({id: 2, type: 'TOGGLE_TODO'})

console.log(store.getState())

store.dispatch({type: 'SET_DISPLAY_FILTER', filter: 'COMPLETED'})

console.log(store.getState())