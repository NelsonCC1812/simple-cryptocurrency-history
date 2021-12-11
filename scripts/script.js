const inputs = document.querySelectorAll("input")
const currency = document.getElementById("currency")
const error = document.getElementById("error")

const max = document.getElementById("max")
const min = document.getElementById("min")

let prices

addCurrencyOptions()
setStartDate()
setChart()
setListeners()

async function addCurrencyOptions(){

  const [,...data] = await (await fetch(`https://api.coinpaprika.com/v1/coins`)).json()

  let option
  data.forEach(elm => {
    
    option = document.createElement('option')
    option.value = elm.id
    option.innerText = elm.name

    currency.appendChild(option)
  })
       
}

function setStartDate(){
    const date = new Date()

    
    inputs[1].value = formatDate(date)
    date.setTime(date.getTime()-2629800000)
    inputs[0].value = formatDate(date)
}

function formatDate(date){
    return `${date.getFullYear()}-${date.getDate()<9?"0" + date.getMonth()+1: date.getMonth()+1}-${date.getDay()<10?"0"+date.getDay():date.getDay()}`
}

function setChart() {

    if (inputs[0].value >= inputs[1].value) error.innerText = "The end date have to be greater than start date"
    else if((new Date(inputs[1].value).getTime()- new Date(inputs[0].value).getTime()) > 31536000000) error.innerText = "The difference between and finish date can not be greater than 1 year"
    else {
        error.innerText = ""

    const end = new Date(inputs[1].value)
    const start = new Date(inputs[0].value)

    fetch(`https://api.coinpaprika.com/v1/coins/${currency.value}/ohlcv/historical?&start=${start.toISOString()}&end=${end.toISOString()}`)
        .then(res => res.json())
        .then(data => printChart(data))
        .then(() => setMaxMin())
        .catch(err =>{
            error.innerText = "Ha habido un error"
            console.log('Ha habido un error ', err)
        })
    }
}

function setListeners() {
    inputs.forEach(elm => elm.onchange = () => setChart())

    currency.onchange = () => setChart()
}

function printChart(data) {

    const dates = data.map(elm=>new Date(elm.time_close).toLocaleDateString())
    prices = data.map(elm => elm.close)

    const ctx = document.getElementById("myChart").getContext("2d")

    new Chart(ctx, {
        type: "line",
        data: {
            labels: dates,
            datasets: [
                {
                    label: currency.value,
                    backgroundColor: "#3973f1",
                    borderColor: "black",
                    data: prices
                }
            ]
        }
    })

}

function setMaxMin() {

    max.innerText = "Max: " + Math.max(...prices).toFixed(2) + " " + currency.value
    min.innerText = "Min: " + Math.min(...prices).toFixed(2) + " " + currency.value
}