// reducer receive state and action, create new state

const counterReducer = (state = 0, action) => {
    switch(action.type){
        case 'INCREASE':
            return state + 1;
        case 'DECREASE':
            return state - 1;
        default:
            return state;
    }
};

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

const store = createStore(counterReducer);

const render = () => {
    document.body.innerText = store.getState();
};

// first time 
render();

// subscribe manually, when action been dispatched, subscribe method called
store.subscribe(render);

// dispatch action, to change state
document.addEventListener('click', () => {
    store.dispatch({ type: 'INCREASE' });
});
