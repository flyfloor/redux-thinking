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

let nextTodoId = 0;

class TodoApp extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            text: '',
        };
    };

    handleAddTodo(){
        store.dispatch({
            id: nextTodoId++,
            text: this.state.text,
            type: 'ADD_TODO'
        });
        this.setState({
            text:'',
        });
    };

    handleToggle(id){
       store.dispatch({
            id: id,
            type: 'TOGGLE_TODO'
       }); 
    };

    render() {
        return (
            <div>
                <input type="text" value={this.state.text} onChange={(e) => this.setState({text: e.target.value})}/>
                <button onClick={this.handleAddTodo.bind(this)}>add todo</button>
                <ul>
                    {this.props.todos.map(todo => {
                        return <li key={todo.id} onClick={this.handleToggle.bind(this, todo.id)}>
                                    {todo.text}
                                    {todo.completed ? <span>✔</span>: null}
                                </li>
                    })}
                </ul>
            </div>
        );
    }
}


const render = () => {
    ReactDOM.render(
        <TodoApp todos={store.getState().todos}/>,
        document.getElementById('root')
    )
}

store.subscribe(render)

render()