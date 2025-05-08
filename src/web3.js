import Web3 from 'web3';

let web3;

if (window.ethereum) {
  web3 = new Web3(window.ethereum);
  await window.ethereum.request({ method: 'eth_requestAccounts' });
} else {
  alert("Vui lòng cài đặt MetaMask!");
}

export default web3;
