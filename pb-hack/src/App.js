import React, { useRef, useState, useEffect } from "react";
import axios from "axios";

const ITEM_ID = "itemId";
function App() {
    const [pbItem, setPbItem] = useState(null);
    const [selected, setSelected] = useState(null);
    const [result, setResult] = useState(null);
    const [ votes, setVotes ] = useState(0);
    const [ votesRegistered, setVotesRegistered ] = useState(0);
    const [itemId, setItemId] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [health, setHealth] = useState(true);
    const [speed, setSpeed] = useState(20000);
    const [isVoting, setIsVoting] = useState(false);
    const [ delay, setDelay ] = useState(5);
    const [ wait, setWait ] = useState(300);

    const interval = useRef(null);
    const timer = useRef(null);

    useEffect(() => {
        if (sessionStorage.getItem(ITEM_ID)) {
            setIsLoading(true);
            setItemId(sessionStorage.getItem(ITEM_ID));
            getQuiz(sessionStorage.getItem(ITEM_ID));
        }
        return () => {
            clearInterval(interval.current);
            interval.current = null;
        };
    }, []);

    useEffect(() => {
        if (delay && !timer.current) {
            setWait(delay * 60); 
        }
    }, [ delay ]);

    useEffect(() => {
        if (!health) {
            clearInterval(interval.current);
            interval.current = null;
            timer.current = setInterval(() => {
                setWait((prev) => prev - 1);
            }, 1000);
            
            setTimeout(() => {
                clearInterval(timer.current);
                timer.current = null;
                setHealth(true);
                setWait(delay*60);
                startVoting();
            }, delay * 60 * 1000);
        }
    }, [health]);

    useEffect(() => {
        pbItem && getResults();
    }, [pbItem]);

    const startVoting = () => {
        if (selected) {
            if (!interval.current) {
                setIsVoting(true);
                const voteInterval = 10000 / speed;
                interval.current = setInterval(vote, voteInterval);
            }
        } else {
            alert("Please select a choice!");
        }
    };

    const getResults = () => {
        const config = {
            url: `https://voting.playbuzz.com/poll/${pbItem.sections[0][0].id}/${pbItem.sections[0][0].questions[0].id}`,
            method: "GET",
            params: {
                questionId: pbItem.sections[0][0].questions[0].id
            }
        };
        axios(config)
            .then((response) => {
                setResult(response.data);
            })
            .catch((error) => {
                console.log(error);
            });
    };

    const vote = () => {
        const config = {
            url: "https://voting.playbuzz.com/poll/",
            method: "POST",
            data: {
                sectionId: pbItem.sections[0][0].id,
                questionId: pbItem.sections[0][0].questions[0].id,
                resultId: selected.id
            },
        };

        axios(config)
            .then((response) => {
                if (response && response.data) {
                    setHealth(true);
                    setVotesRegistered((prev) => prev + 1);
                    setResult(response.data);
                } else {
                    setHealth(false);
                }
                setVotes((prevVotes) => prevVotes + 1);
                //getResults();
            })
            .catch((error) => {
                console.log(error);
            });
    };

    const getQuiz = (id) => {
        const htmlConfig = {
            url: "https://embed.playbuzz.com/html",
            params: {
                id: id ? id : itemId
            },
            method: "GET"
        };
        axios(htmlConfig)
            .then((response) => {
                !id && sessionStorage.setItem(ITEM_ID, itemId);
                const html = response.data;
                const el = document.createElement("html");
                el.innerHTML = html;
                const script = el.getElementsByTagName("script")[4];
                const begin = script.innerHTML.indexOf("window.pbItem");
                const end = script.innerHTML.indexOf(";", begin);
                const extracted = script.innerHTML.substring(begin, end + 1);
                const s = document.createElement("script");
                s.innerHTML = extracted;
                document.body.append(s);
                setPbItem(window.pbItem);
            })
            .catch((error) => {
                alert("Couldn't fetch the quiz. Re-check the item ID you entered!");
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    const calculatePercentage = (id) => {
        if (result) {
            let total = 0;
            Object.entries(result.results).forEach(([key, value]) => {
                total += parseInt(value);
            });
            return Math.round((parseInt(result.results[id]) / total) * 100);
        }
        return 0;
    };

    const stopVoting = () => {
        setIsVoting(false);
        clearInterval(interval.current);
        interval.current = null;
        clearInterval(timer.current);
        timer.current = null;
        setWait(delay * 60);
        setHealth(true);
    };

    const reset = () => {
        sessionStorage.removeItem(ITEM_ID);
        setItemId("");
        setPbItem(null);
        setVotes(0);
        setSelected(null);
        setResult(null);
        setPbItem(null);
        clearInterval(interval.current);
    };

    return pbItem ? (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                flexDirection: "column",
                alignItems: "center",
                padding: "20px",
                minHeight: "calc(100vh - 40px)"
            }}>
            <h1 style={{ textAlign: "center" }}>{pbItem.title}</h1>
            <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ display: "flex", justifyContent: "space-around" }}>
                    {pbItem.sections[0][0].questions[0].answers.map((answer, index) => {
                        return (
                            <div
                                style={{
                                    boxShadow: "#949494 0px 0px 3px 0px",
                                    borderRadius: "10px",
                                    overflow: "hidden",
                                    border: selected && selected.id === answer.id ? "solid 2px #78da78" : "none",
                                    maxWidth: "200px",
                                    width: "45%"
                                }}
                                key={index}
                                onClick={() => {
                                    setSelected(answer);
                                }}>
                                <div
                                    style={{
                                        width: "100%",
                                        overflow: "hidden",
                                        position: "relative",
                                        height: "auto"
                                    }}>
                                    <div
                                        style={{
                                            position: "absolute",
                                            bottom: 0,
                                            right: 0,
                                            left: 0,
                                            backgroundColor: "green",
                                            opacity: "0.7",
                                            height: calculatePercentage(answer.id) + "%",
                                            transition: "height 1s ease-in-out"
                                        }}></div>
                                    <img style={{ width: "100%" }} src={answer.media.url} />
                                </div>
                                <div style={{ padding: "10px" }}>
                                    <h3>{answer.text}</h3>
                                    <div>Votes: {result && result.results[answer.id]}</div>
                                    <div>Percentage: {calculatePercentage(answer.id) + "%" || ""}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "50px" }}>
                    <h5 style={{ textAlign: "center" }}>
                        {votes !== 0 && <div>My Votes: {votes}</div>}
                        {isVoting ? health ? <div>Health &#128578;</div> : <div>Health &#128577;</div> : null}
                    </h5>
                    { !health && isVoting && <h5>
                        Wait for {wait} seconds
                    </h5> }
                    <h5 style={{ textAlign: "center" }}>
                        {votes !== 0 && <div>Registered Votes: {votesRegistered}</div>}
                    </h5>
                    <label>Votes per 10 seconds:</label>
                    <input
                        style={{
                            padding: "10px",
                            margin: "10px",
                            borderRadius: "5px",
                            border: "1px solid gainsboro",
                            fontSize: "1em",
                            maxWidth: "400px",
                            width: "calc(100% - 20px)"
                        }}
                        onChange={(e) => {
                            setSpeed(parseInt(e.target.value));
                        }}
                        type="number"
                        value={speed}
                    />
                    <label>Minutes to wait after failure:</label>
                    <input
                        style={{
                            padding: "10px",
                            margin: "10px",
                            borderRadius: "5px",
                            border: "1px solid gainsboro",
                            fontSize: "1em",
                            maxWidth: "400px",
                            width: "calc(100% - 20px)"
                        }}
                        onChange={(e) => {
                            setDelay(parseInt(e.target.value));
                        }}
                        type="number"
                        value={delay}
                    />
                    <div style={{ display: "flex", justifyContent: "center" }}>
                        {!isVoting ? (
                            <button
                                style={{
                                    padding: "10px",
                                    borderRadius: "5px",
                                    fontSize: "1em",
                                    backgroundColor: "#77da78",
                                    margin: "10px",
                                    border: "none",
                                    cursor: "pointer",
                                    color: "white",
                                    fontWeight: "bold"
                                }}
                                onClick={startVoting}>
                                Start Voting!
                            </button>
                        ) : (
                            <button
                                style={{
                                    padding: "10px",
                                    borderRadius: "5px",
                                    fontSize: "1em",
                                    backgroundColor: "red",
                                    margin: "10px",
                                    border: "none",
                                    cursor: "pointer",
                                    color: "white",
                                    fontWeight: "bold"
                                }}
                                onClick={() => {
                                    stopVoting();
                                }}>
                                Stop Voting
                            </button>
                        )}
                        <button
                            style={{
                                padding: "10px",
                                borderRadius: "5px",
                                fontSize: "1em",
                                backgroundColor: "teal",
                                margin: "10px",
                                border: "none",
                                cursor: "pointer",
                                color: "white",
                                fontWeight: "bold"
                            }}
                            onClick={() => {
                                getResults();
                            }}>
                            Check Results
                        </button>
                        <button
                            style={{
                                padding: "10px",
                                borderRadius: "5px",
                                fontSize: "1em",
                                backgroundColor: "orange",
                                margin: "10px",
                                border: "none",
                                cursor: "pointer",
                                color: "white",
                                fontWeight: "bold"
                            }}
                            onClick={() => {
                                reset();
                            }}>
                            Exit Quiz
                        </button>
                    </div>
                </div>
            </div>
        </div>
    ) : (
        !isLoading && (
            <div style={{ width: "100%", display: "flex", justifyContent: "center", minHeight: "100vh" }}>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        margin: "20px",
                        maxWidth: "400px",
                        width: "calc(100% - 40px)"
                    }}>
                    <label>Enter quiz item ID:</label>
                    <input
                        style={{
                            padding: "10px",
                            margin: "10px",
                            borderRadius: "5px",
                            border: "1px solid gainsboro",
                            fontSize: "1em",
                            maxWidth: "400px",
                            width: "calc(100% - 20px)"
                        }}
                        onChange={(e) => {
                            setItemId(e.target.value);
                        }}
                        type="text"
                        value={itemId}
                    />
                    <button
                        style={{
                            padding: "10px",
                            borderRadius: "5px",
                            fontSize: "1em",
                            backgroundColor: "#77da78",
                            margin: "10px",
                            border: "none",
                            cursor: "pointer",
                            color: "white",
                            fontWeight: "bold"
                        }}
                        onClick={() => {
                            getQuiz();
                        }}>
                        Get Quiz!
                    </button>
                </div>
            </div>
        )
    );
}

export default App;
