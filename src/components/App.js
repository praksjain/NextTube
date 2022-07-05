import React, { Component, useCallback } from 'react';
import NextTube from '../abis/NextTube.json'
import Navbar from './Navbar'
import Main from './Main'
import Web3 from 'web3';
import './App.css';

//Declare IPFS
const ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' })

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3
    //Load accounts
    const accounts = await web3.eth.getAccounts()

    //Add first account to the state
    this.setState({ account: accounts[0] })

    //Get network ID
    const networkId = await web3.eth.net.getId()

    //Get network data
    const networkData = NextTube.networks[networkId]

    //Check if net data exists
    if (networkData) {
      // Then Assign nexttube contract to a variable
      const nexttube = new web3.eth.Contract(NextTube.abi, networkData.address)

      //Add nexttube to the state
      this.setState({ nexttube: nexttube })

      //Check videoCount
      const videosCount = await nexttube.methods.videoCount().call()

      //Add videoCount to the state
      this.setState({ videosCount })

      //Iterate throught videos and add them to the state (by newest)
      for (var i = videosCount; i >= 1; i--) {
        const video = await nexttube.methods.videos(i).call()
        this.setState({ videos: [...this.state.videos, video] })
      }

      //Set latest video and it's title to view as default
      const latest = await nexttube.methods.videos(videosCount).call()
      this.setState({ currentHash: latest.hash, currentTitle: latest.title })
      // console.log("Here i am ", latest)

      //Set loading state to false
      this.setState({ loading: false })
    }
    //If network data doesn't exisits, log error
    else {
      window.alert("Contract is not deployed..!!")
    }
  }

  //Get video
  captureFile = event => {
    event.preventDefault()
    const file = event.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)

    reader.onloadend = () => {
      this.setState({ buffer: Buffer(reader.result) })
    }
  }

  //Upload video
  uploadVideo = title => {
    console.log("Submitting file to IPFS...")
    ipfs.add(this.state.buffer, (error, result) => {
      console.log('IPFS Output', result[0].hash)
      if (error) {
        console.error(error)
        return
      }
      this.setState({ loading: true })
      this.state.nexttube.methods.uploadVideo(result[0].hash, title).send({ from: this.state.account }).on('transactionHash', (hash) => {
        this.setState({ loading: false })
      })
    })
  }

  //Change Video
  changeVideo = (hash, title) => {
    this.setState({ 'currenHash': hash });
    this.setState({ 'currenTitle': title });
  }

  constructor(props) {
    super(props)
    this.state = {
      loading: true,
      //set states
      account: '',
      currentHash: null,
      currentTitle: null,
      videos: [],
      buffer: null,
      nexttube: null
    }

    //Bind functions
  }

  render() {
    return (
      <div>
        <Navbar
          //Account
          account={this.state.account}
        />
        {this.state.loading
          ? <div id="loader" className="text-center mt-5"><p>Loading...</p></div>
          : <Main
            uploadVideo={this.uploadVideo}
            captureFile={this.captureFile}
            videos={this.state.videos}
            currentHash={this.state.currentHash}
            currentTitle={this.state.currentTitle}
            changeVideo={this.changeVideo}

          />
        }
      </div>
    );
  }
}

export default App;