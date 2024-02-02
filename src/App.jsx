import { useEffect, useState } from "react";
import "./App.css";
import lottery from "./lib/lottery";
import web3 from "./lib/web3";
function App() {
    const [manager, setManger] = useState("");
    const [players, setPlayers] = useState([]);
    const [balance, setBalance] = useState(0);
    const [value, setValue] = useState(0);
    const [message, setMessage] = useState("Want to try your luck?");
    const [winner, setWinner] = useState("");

    async function fetchData() {
        const manager = await lottery.methods.manager().call();
        setManger(manager);
        const players = await lottery.methods.getPlayers().call();
        setPlayers(players);
        const balance = await web3.eth.getBalance(lottery.options.address);
        setBalance(balance);

        console.log(manager);
        console.log(players);
        console.log(balance);
    }

    const submit = async (event) => {
        event.preventDefault();
        setMessage("Waiting on transaction success...");
        const accounts = await web3.eth.getAccounts();
        console.log(accounts);
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei(value, "ether"),
        });
        setMessage("You have been entered!");
        setTimeout(() => {
            setMessage("Want to try your luck again?");
        }, 3000);
        setValue(0);
    };

    const pickWinner = async () => {
        const accounts = await web3.eth.getAccounts();
        await lottery.methods.pickWinner().send({
            from: accounts[0],
        });
        const winner = await lottery.methods.winner().call();
        setWinner(winner);
    };
    useEffect(() => {
        fetchData();
    }, [value, winner]);
    return (
        <div>
            <h2>Lottery Contract</h2>
            <p>
                This contract is managed by {manager}. There are currently{" "}
                {players.length} people entered, competing to win{" "}
                {web3.utils.fromWei(balance, "ether")} ether!
            </p>

            <hr />
            <form onSubmit={submit}>
                <h4>{message}</h4>
                <div>
                    <label>Amount of ether to enter</label>
                    <input
                        value={value}
                        onChange={(event) => {
                            setValue(event.target.value);
                        }}
                    />
                </div>
                <button>Enter</button>
            </form>

            <hr />

            <h4>Ready to pick a winner?</h4>
            <button onClick={pickWinner}>Pick a winner!</button>

            <hr />

            <h3>winner of last lottery is {winner}</h3>
        </div>
    );
}

export default App;
