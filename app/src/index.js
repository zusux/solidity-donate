import Web3 from "web3";
import DonatesArtifact from "../../build/contracts/Donates.json";

const App = {
  web3: null,
  account: null,
  meta: null,

  start: async function () {
    const {web3} = this;

    try {
      // get contract instance
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = DonatesArtifact.networks[networkId];
      this.meta = new web3.eth.Contract(
          DonatesArtifact.abi,
          deployedNetwork.address,
      );

      // get accounts
      const accounts = await web3.eth.getAccounts();
      this.account = accounts[0];

      this.refreshBalance();
      this.refreshContractBalance();
      this.getDonateList();
      this.getUser();
    } catch (error) {
      console.error("Could not connect to contract or chain.");
    }
  },

  //刷新余额
  refreshBalance: async function () {
    const {getBalance} = this.meta.methods;
    const balance = await getBalance(this.account).call();

    const balanceElement = document.getElementsByClassName("balance")[0];

    let eth = Web3.utils.fromWei(balance)

    balanceElement.innerHTML = eth;
  },

  refreshContractBalance: async function () {
    const {donateAmount} = this.meta.methods;
    const balance = await donateAmount().call();
    const balanceElement = document.getElementById("accountView");
    balanceElement.innerHTML = balance;
  },

  sendCoin: async function () {
    const amount = parseInt(document.getElementById("amount").value);
    let layer = layui.layer
    var index = layer.load(0, {
      shade: [0.1, '#fff'] //0.1透明度的白色背景
    });
    try {
      const {donate} = this.meta.methods;
      await donate().send({from: this.account, value: Web3.utils.toWei(amount.toString(), "wei")});
      layer.close(index);
    } catch (e) {
      layer.tips(e, '#donate', {
        tips: [1, '#3595CC'],
        time: 4000
      });
      layer.close(index);
    }
    this.refreshBalance();
    this.refreshContractBalance();
    this.getDonateList();
  },

  setName: async function () {
    const name = document.getElementById("name").value;
    console.log('name', name)
    let layer = layui.layer
    var index = layer.load(0, {
      shade: [0.1, '#fff'] //0.1透明度的白色背景
    });
    try {
      const {setName} = this.meta.methods;
      await setName(name).send({from: this.account});
      layer.close(index);
    } catch (e) {
      console.log(e)
      layer.tips(e, '#setName', {
        tips: [1, '#3595CC'],
        time: 4000
      });
      layer.close(index);
    }
    this.getUser();
  },
  getDonateList: async function () {
    const {donateList} = this.meta.methods;
    let layer = layui.layer
    var index = layer.load(1, {
      shade: [0.1, '#fff'] //0.1透明度的白色背景
    });
    const res = await donateList().call();
    console.log(res)
    let laytpl = layui.laytpl;
    let getTpl = document.getElementById("donateTpl").innerHTML
    let view = document.getElementById('donateView');
    let data = { //数据
      "title": "捐款列表",
      "list": res,
    }
    laytpl(getTpl).render(data, function (html) {
      view.innerHTML = html;
    });
    layer.close(index);
  },

  getUser: async function () {
    const {getUsers} = this.meta.methods;
    let layer = layui.layer
    var index = layer.load(1, {
      shade: [0.1, '#fff'] //0.1透明度的白色背景
    });
    const res = await getUsers().call();
    console.log(res)
    let laytpl = layui.laytpl;
    let getTpl = document.getElementById("userTpl").innerHTML
    let view = document.getElementById('userView');
    let data = { //数据
      "title": "用户列表",
      "list": res,
    }
    laytpl(getTpl).render(data, function (html) {
      view.innerHTML = html;
    });
    layer.close(index);
  },
};

window.App = App;

window.addEventListener("load", function () {
  if (window.ethereum) {
    // use MetaMask's provider
    App.web3 = new Web3(window.ethereum);
    window.ethereum.enable(); // get permission to access accounts
  } else {
    console.warn(
        "No web3 detected. Falling back to http://127.0.0.1:8545. You should remove this fallback when you deploy live",
    );
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    App.web3 = new Web3(
        new Web3.providers.HttpProvider("http://127.0.0.1:8545"),
    );
  }

  App.start();
});
