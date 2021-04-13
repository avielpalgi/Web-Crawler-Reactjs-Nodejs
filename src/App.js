import { Form, Button } from 'react-bootstrap';
import React, { useState } from 'react';
import './App.css';
import axios from 'axios'


function App() {
  const [depth, setDepth] = useState(2);
  const [value, setValue] = useState('');
  const [valid, setValid] = useState(true);
  const [res, setRes] = useState(false);
  const [list, setlist] = useState(null);
  const [validColor, setvalidColor] = useState('none')
  const [errorClass, setErrorClass] = useState("none-result")

  const handleChange = (e) => {
    setValue(e.target.value);
    setlist(null);
    setRes(false);
    setValid(isUrlValid(e.target.value))
    if (isUrlValid(e.target.value)) {
      setvalidColor("myButton")
    }
    else {
      setvalidColor('none')
    }
  }
  const handleChangeDepth = (e) => {
    setDepth(e.target.value);
    setlist(null);
    setRes(false);
  }

  function isUrlValid(userInput) {
    var res = userInput.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
    if(res == null)
        return false;
    else
        return true;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setRes(true);
    let urlAndDepth = {
      url: value.toString(),
      depth: depth
    }
    SendToServer(urlAndDepth);
  }

  const SendToServer = async (urlAndDepth) => {
    axios.post('http://localhost:4000/app/urls',urlAndDepth)
    .then(response => console.log(response.data))

  }

  const GetFromServer = (data) => {
    if (data.data == "sorry") {
      setErrorClass("error")
    }
    else {
      setlist(data.data);
    }
  }
  

  const clear = () => {
    setValue("");
    setDepth(2);
    setlist(null);
    setRes(false);
    setvalidColor('none');
    setErrorClass('none-result')
  }


  return (
    <div className="Home">
      <div className="MainForm">
        <div className="Instructions">
          <h2>Input the website you'd like to crawl</h2>
        </div>
        <div className="Input">
          <form onSubmit={handleSubmit}>

            <Form.Group bsSize="large" validationState={isUrlValid}>
              <Form.Label>URL Website:</Form.Label>
              <Form.Control
                type="text"
                value={value}
                placeholder="e.g. google.com"
                onChange={handleChange} />
              <Form.Control.Feedback />
            </Form.Group>
            <Form.Group bsSize="large">
              <Form.Label>Num of Depth(default is 2):</Form.Label>
              <Form.Control
                type="number"
                value={depth}
                placeholder="enter depth"
                onChange={handleChangeDepth} />
              <Form.Control.Feedback />
            </Form.Group>
            <Button className={validColor} bsSize="large" bsStyle="primary" type="submit" onClick={handleSubmit} disabled={!valid}>
              Crawl!
        </Button>
          </form>
        </div>
        <div className={res ? 'Result' : 'none-result'}>
          <h2>URL:{value}   Depth: {depth}</h2>
          <ul className="ulList">{list ? list.map((link) => <li>{link.text} - {link.href}</li>) : null}</ul>
        </div>
        <div className={errorClass}><h1>Error</h1></div>
        <Button className="redButton" bsSize="large" bsStyle="primary" type="button" onClick={clear} >
          Clear
        </Button>
      </div>
    </div >
  );
}

export default App;
