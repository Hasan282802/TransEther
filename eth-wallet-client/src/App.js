import React, { useState, useEffect } from "react";
import Wallet from "./contracts/Wallet.json";
import getWeb3 from "./utils/getWeb3";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Paper,
  CssBaseline,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#d32f2f' },
  },
  typography: {
    h4: { color: '#ffffff' },
    body1: { color: '#ffffff' }
  }
});

const App = () => {
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [contract, setContract] = useState(null);
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [transactions, setTransactions] = useState(() => {
    const savedTransactions = localStorage.getItem("transactions");
    return savedTransactions ? JSON.parse(savedTransactions) : [];
  });

  useEffect(() => {
    const init = async () => {
      try {
        const web3 = await getWeb3();
        const accounts = await web3.eth.getAccounts();
        const networkId = await web3.eth.net.getId();
        const deployedNetwork = Wallet.networks[networkId];
        if (!deployedNetwork) {
          console.error("Contract not deployed on the current network");
          return;
        }
        const instance = new web3.eth.Contract(
          Wallet.abi,
          deployedNetwork && deployedNetwork.address,
        );

        setWeb3(web3);
        setAccounts(accounts);
        setContract(instance);

        // Listen for account changes
        if (window.ethereum) {
          window.ethereum.on('accountsChanged', (newAccounts) => {
            setAccounts(newAccounts);
          });
        }
      } catch (error) {
        console.error("Could not connect to contract or chain.", error);
      }
    };
    init();
  }, []);

  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);

  const sendEther = async () => {
    if (amount > 0 ){
    try {
      const amountInWei = web3.utils.toWei(amount, "ether");
      
        console.log("Sending", amount, "ETH to", toAddress);
        const gas = await contract.methods.sendEther(toAddress).estimateGas({
          from: accounts[0],
          value: amountInWei
        });

      console.log("Estimated gas:", gas);
      await contract.methods.sendEther(toAddress).send({
        from: accounts[0],
        value: amountInWei,
        gas
      });
      setMessage("Transaction successful!");

      // Log the transaction
      const transaction = {
        from: accounts[0],
        to: toAddress,
        amount: amount,
        timestamp: new Date().toLocaleString()
      };
      setTransactions([transaction, ...transactions]);
    } catch (error) {
      console.error("Gas estimation failed:", error.message);
      console.error("Transaction failed:", error);
      setMessage(`Transaction failed: ${error.message}`);
    }
  }
  else{
    setMessage("Are You Kidding?!, Put some Ethereum to transfer");
  }
  };

  const connectMetaMask = async () => {
    try {
      if (web3 && web3.currentProvider) {
        await web3.currentProvider.request({ method: "eth_requestAccounts" });
        const accounts = await web3.eth.getAccounts();
        setAccounts(accounts);
      }
    } catch (error) {
      console.error("Failed to connect to MetaMask", error);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="sm" style={{ marginTop: '50px' }}>
        <Paper elevation={3} style={{ padding: '20px', backgroundColor: 'rgba(0, 0, 0, 0.7)' }}>
          <Box textAlign="center">
            <Typography variant="h4" gutterBottom>TransEther</Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={connectMetaMask}>
              {accounts.length ? 'Connected to MetaMask' : 'Connect to MetaMask'}
            </Button>
          </Box>

          {accounts.length > 0 && (
            <>
              <Box mt={4} textAlign="center">
                <Typography variant="body1">Your Address: {accounts[0]}</Typography>
              </Box>
              <Box mt={4}>
                <TextField
                  label="Recipient Address"
                  fullWidth
                  variant="outlined"
                  value={toAddress}
                  onChange={(e) => setToAddress(e.target.value)}
                  margin="normal"
                  InputLabelProps={{ style: { color: '#fff' } }}
                  InputProps={{ style: { color: '#fff' } }}
                />
                <TextField
                  label="Amount (ETH)"
                  fullWidth
                  variant="outlined"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  margin="normal"
                  InputLabelProps={{ style: { color: '#fff' } }}
                  InputProps={{ style: { color: '#fff' } }}
                />
                <Button
                  variant="contained"
                  color="secondary"
                  fullWidth
                  onClick={sendEther}
                  style={{ marginTop: '20px' }}>
                  Send Ether
                </Button>
              </Box>
            </>
          )}

          {message && (
            <Box mt={4}>
              <Alert severity={message.includes("successful") ? "success" : "error"}>{message}</Alert>
            </Box>
          )}

          <Box mt={4}>
            <Typography variant="h6" gutterBottom style={{ color: '#fff' }}>Transaction Log</Typography>
            <Box maxHeight="200px" overflow="auto" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', padding: '10px', borderRadius: '8px' }}>
              <List>
                {transactions.map((tx, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemText
                        primary={<Typography style={{ color: '#fff' }}>From: {tx.from} To: {tx.to}</Typography>}
                        secondary={<Typography style={{ color: '#fff' }}>Amount: {tx.amount} ETH - {tx.timestamp}</Typography>}
                      />
                    </ListItem>
                    <Divider style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)' }} />
                  </React.Fragment>
                )).reverse()}
              </List>
            </Box>
          </Box>
        </Paper>
      </Container>
    </ThemeProvider>
  );
};

export default App;
