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


const Link = ({active, children, onClick}) => {
    if (active) return <span> {children} </span>;
    return (
        <a href="javascript:;" style={{marginRight: 3}}
            onClick={onClick}>
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


const Footer = ({}) => {
    return <p>
                filter: 
                <FilterLink filter='ALL'>
                    all
                </FilterLink>
                <FilterLink filter='COMPLETED'> 
                    completed 
                </FilterLink>
                <FilterLink filter='ACTIVE'>
                    active 
                </FilterLink>
            </p>
}

const store = createStore(todoAppReducer)

// container

let nextTodoId = 0;

class FilterLink extends React.Component {
    componentDidMount() {
        this.unsubscribe = store.subscribe(() => {
            this.forceUpdate();
        })    
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    render() {
        const props = this.props;
        const state = store.getState();

        return (
            <Link active={props.filter === state.displayFilter}
                onClick={() => store.dispatch({ type: 'SET_DISPLAY_FILTER', filter: props.filter })}>
                {props.children}
            </Link>
        );
    }
}


class FilterTodoList extends React.Component {
    componentDidMount() {
        this.unsubscribe = store.subscribe(() => {
            this.forceUpdate();
        })    
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    render() {
        const props = this.props;
        const state = store.getState();

        return (
            <TodoList 
                todos={ getFilterTodos(state.todos, state.displayFilter)}
                onTodoClick={(id) => store.dispatch({
                    id,
                    type: 'TOGGLE_TODO'
                })}/>
        );
    }
}

const AddTodo = () => {
    let input;
    let handleAddTodo = () => {
        if (!input.value) return;
        let value = input.value.replace(/ /g, '');
        store.dispatch({
            type: 'ADD_TODO',
            id: nextTodoId++,
            text: value,
        });
        input.value = '';
    }
    return (
        <div>
            <input type="text" ref={ node => input = node}/>
            <button onClick={handleAddTodo}>add todo</button>
        </div>
    )
}



class TodoApp extends React.Component {
    render() {
        return (
            <div>
                <AddTodo />
                <FilterTodoList />
                <Footer />
            </div>
        );
    }
}

ReactDOM.render(
    <TodoApp {...store.getState()}/>,
    document.getElementById('root')
)
