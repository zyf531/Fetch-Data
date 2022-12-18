const Pagination = ({ items, pageSize, onPageChange }) => {
    const { Button } = ReactBootstrap;
    const { useState } = React;
    if (items.length <= 1) return null;

    let num = Math.ceil(items.length / pageSize);
    let pages = range(1, num);
    const list = pages.map(page => {
        return (
            <Button key={page} onClick={onPageChange} className="page-item">
                {page}
            </Button>
        );
    });

    const [pageInput, setPageInput] = useState('');
    return (
        <nav>
            <ul className="pagination">
                {list}
                <input type="text" size="5" value={pageInput} onChange={e => setPageInput(e.target.value)} onBlur={onPageChange} />
            </ul>
            
        </nav>
    );
};

const range = (start, end) => {
    return Array(end - start + 1)
        .fill(0)
        .map((item, i) => start + i);
};

function paginate(items, pageNumber, pageSize) {
    const start = (pageNumber - 1) * pageSize;
    let page = items.slice(start, start + pageSize);
    return page;

}

const useDataApi = (initialUrl, initialData) => {
    const { useState, useEffect, useReducer} = React;
    const [url, setUrl] = useState(initialUrl);

    const [state, dispatch] = useReducer(dataFetchReducer, {
        isLoading: false,
        isError: false,
        data: initialData,
    });

    useEffect(() => {
        let didCancel = false;
        const fetchData = async () => {
            console.log("Fetching data...");
            dispatch({ type: "FETCH_INIT" });
            try {
                const result = await axios(url);
                console.log('result: ', result);
                if (!didCancel) {
                    dispatch({ type: "FETCH_SUCCESS", payload: result.data });
                }
            } catch (error) {
                if (!didCancel) {
                    dispatch({ type: "FETCH_FAILURE" });
                }
            }
        };

        fetchData();
        return () => {
            didCancel = true;
        }
    }, [url]);

    return [state, setUrl];
};

const dataFetchReducer = (state, action) => {
    switch (action.type) {
        case "FETCH_INIT":
            return {
                ...state,
                isLoading: true,
                isError: false,
            };
        case "FETCH_SUCCESS":
            return {
                ...state,
                isLoading: false,
                isError: false,
                data: action.payload,
            };
        case "FETCH_FAILURE":
            return {
                ...state,
                isLoading: false,
                isError: true,
            };
        default: 
            throw new Error();
    }
};

function App() {
    console.log("Start Rendering App ...");
    const { Fragment, useState, useEffect, useReducer } = React;
    const [query, setQuery] = useState("MIT");
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;
    const [{ data, isLoading, isError}, doFetch] = useDataApi(
        "https://hn.algolia.com/api/v1/search?query=MIT",
        {
            hits: []
        }
    );

    const handlePageChange = e => {
        setCurrentPage(Number(e.target.textContent ? e.target.textContent : e.target.value));
    };

    let page = data.hits;
    if (page.length >= 1) {
        page = paginate(page, currentPage, pageSize);
        console.log(`currentPage: ${currentPage}`);
    }

    return (
        <Fragment>
            <form onSubmit={event => {
                console.log("submit button clicked ...");
                doFetch(`https://hn.algolia.com/api/v1/search?query=${query}`);
                event.preventDefault();
            }}>
                <input type="text" value={query} onChange={event => setQuery(event.target.value)} />
                <button>Search</button>
            </form>
            {isError && <div>Something went wrong ...</div>}

            {isLoading ? 
            ( <div>Loading...</div> ) : 
            ( <ul className='list-group' > {page.map(item => ( 
                <li key={item.objectID} className='list-group-item' >
                    <a href={item.url}>{item.title}</a>
                </li> 
            ))} </ul>)}

            <Pagination 
                items={data.hits} 
                pageSize={pageSize} 
                onPageChange={handlePageChange}
            ></Pagination>
        </Fragment>
    );
}

ReactDOM.render(<App />, document.getElementById("root"));