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


const FilterLink = ({filter, currentFilter, children}) => {
    if (currentFilter === filter) return <span> {children} </span>;
    return (
        <a href="javascript:;" style={{marginRight: 3}}
            onClick={ () => store.dispatch({ type: 'SET_DISPLAY_FILTER', filter }) }>
            {children}
        </a>
    )
}

const getFilterTodos = (todos, filter) => {
    switch(filter) {
        case 'COMPLETED':
            return todos.filter(todo => todo.completed);
        case 'ACTIVE':
            return todos.filter(todo => !todo.completed);
        default:
            return todos;
    }
}

const Todo = ({ text, completed, onClick }) => {
    return <li onClick={onClick}
                style={{textDecoration: completed ? 'line-through': 'none'}}>
                {text}
            </li>
}

const TodoList = ({ todos, onTodoClick }) => {
    return <ul>
                {todos.map(todo => {
                    return <Todo key={todo.id} 
                                {...todo}
                                onClick={() => onTodoClick(todo.id)}/>
                })}
            </ul>
}

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
        const {todos, displayFilter} = this.props;

        const filterTodos = getFilterTodos(todos, displayFilter);
        return (
            <div>
                <input type="text" value={this.state.text} onChange={(e) => this.setState({text: e.target.value})}/>
                <button onClick={this.handleAddTodo.bind(this)}>add todo</button>
                <TodoList todos={filterTodos} 
                    onTodoClick={(id) => store.dispatch({
                        id: id,
                        type: 'TOGGLE_TODO'
                    })}/>
                <p>
                    filter: 
                    <FilterLink filter='ALL' currentFilter={displayFilter}>
                        all
                    </FilterLink>
                    <FilterLink filter='COMPLETED' currentFilter={displayFilter}> 
                        completed 
                    </FilterLink>
                    <FilterLink filter='ACTIVE' currentFilter={displayFilter}> 
                        active 
                    </FilterLink>
                </p>
            </div>
        );
    }
}


const render = () => {
    ReactDOM.render(
        <TodoApp {...store.getState()}/>,
        document.getElementById('root')
    )
}

store.subscribe(render)

render()