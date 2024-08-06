import axios from 'axios'

function App() {

  const handleSubmit = async (e) => {
    e.preventDefault()
    let res = await axios.post("http://localhost:8000/payment")
    console.log(res)

    if (res && res.data) {
      let link = res.data.links[1].href
      console.log("Redirecting to:", link);
      window.location.href = link
    }
  }

  return (
    <div>
      <p>click the following button to buy</p>
      <button onClick={handleSubmit}>begin the purchase</button>
    </div>
  )
}

export default App
