import React, { useEffect, useState } from "react";
import {
  getStockOverview,
  getStockCashFlow,
  getStockBalanceSheet,
  getStockPrice,
} from "../../ApiConnector.js";

const SpecificStockDetails = () => {
  // Variable and State Declaration
  const [symbol, setSymbol] = useState();
  const [eps, setEPS] = useState();
  const [beta, setBeta] = useState();
  const [shsOut, setShsOut] = useState();
  const [cshFromOperation, setCshFromOperation] = useState();
  const [shortTmDebt, setShortTmDebt] = useState();
  const [longTmDebt, setLongTmDebt] = useState();
  const [totalDebt, setTotalDebt] = useState();
  const [cshandShortTmInv, setCshandShortTmInv] = useState();
  const [prevClose, setPrevClose] = useState();

  const [valProfit20yrs , setValProfit20yrs] = useState();
  const [valintValbefDebt , setValintValbefDebt] = useState();
  const [vallessdebtpershare , setVallessdebtpershare] = useState();
  const [valpluscashpershare , setpluscashpershare] = useState();
  const [valfinalIntValBefDebt , setfinalIntValBefDebt] = useState();
  const [premium, setPremium] = useState();

  //Function
  const fetchStockData = async () => {
    //Summary
    const symbol = document.getElementById("txtSymbol").value;
    const result = await getStockOverview(symbol);
    setSymbol(result.data.Symbol);
    setBeta(result.data.Beta);
    setShsOut(
      convertToInternationalCurrencySystem(result.data.SharesOutstanding)
    );

    //Cash Flow
    const result1 = await getStockCashFlow(symbol);
    setCshFromOperation(
      convertToInternationalCurrencySystem(
        result1.data.annualReports[0].operatingCashflow
      )
    );

    //Balance Sheet
    const result2 = await getStockBalanceSheet(symbol);
    console.log(result2.data);
    setShortTmDebt(result2.data.annualReports[0].shortTermDebt);
    setLongTmDebt(result2.data.annualReports[0].longTermDebt);
    setTotalDebt(
      convertToInternationalCurrencySystem(
        sumValue(
          result2.data.annualReports[0].shortTermDebt,
          result2.data.annualReports[0].longTermDebt
        )
      )
    );
    setCshandShortTmInv(
      convertToInternationalCurrencySystem(
        result2.data.annualReports[0].cashAndShortTermInvestments
      )
    );

    //Stock Price
    const result3 = await getStockPrice(symbol);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    let date = formatDate(yesterday);

    for (var key in result3.data["Time Series (Daily)"]) {
      if (key === date) {
        setPrevClose(result3.data["Time Series (Daily)"][key]["4. close"]);
      }
      break;
    }
  };

  function convertToInternationalCurrencySystem(labelValue) {
    return Math.abs(Number(labelValue / 1.0e6)).toFixed(2);
  }

  function sumValue(value1, value2) {
    value1 = parseFloat(value1);
    value2 = parseFloat(value2);
    const value = value1 + value2;
    return value;
  }

  const eps5handler = (event) => {
    let value = event.target.value;
    value = parseFloat(value);
    let eps10yrs = value / 2;
    if (eps10yrs > 15) {
      eps10yrs = 15;
    }
    document.getElementById("eps10yrs").value = eps10yrs;
  };

  const debtHandler = (event) => {
    console.log(event.target.value);
    setTotalDebt(event.target.value);
  }

  function calculateIntrinsicValue() {
    let cashFromOperation = parseFloat(cshFromOperation);
    const eps5yrs = parseFloat(document.getElementById("eps5yrs").value)/100;
    const eps10yrs = parseFloat(document.getElementById("eps10yrs").value)/100;
    const eps20yrs = 0.0418;

    const DR = (beta) => {
      if (beta < 0.8) {
        return 0.046;
      } else if (beta >= 0.8 && beta < 1) {
        return 0.051;
      } else if (beta >= 1 && beta < 1.1) {
        return 0.056;
      } else if (beta >= 1.1 && beta < 1.2) {
        return 0.061;
      } else if (beta >= 1.2 && beta < 1.3) {
        return 0.066;
      } else if (beta >= 1.3 && beta < 1.4) {
        return 0.071;
      } else if (beta >= 1.4 && beta < 1.5) {
        return 0.076;
      } else if (beta >= 1.5 && beta < 1.6) {
        return 0.081;
      } else if (beta >= 1.6) {
        return 0.086;
      }
    };

    const discountrate = DR(beta);
    var i;
    let sumCashFromOperation = 0;
    let discountfactor = 0;
    let discountvalue = 0;

    for (i = 0; i < 20; i++) {
      if (i == 0) {
        cashFromOperation = cashFromOperation * (1 + eps5yrs);
        discountfactor = (1/(1+discountrate));
        discountvalue = cashFromOperation*discountfactor;
        sumCashFromOperation += discountvalue;
      } else if (i >= 1 && i < 5){
        cashFromOperation = cashFromOperation * (1 + eps5yrs);
        discountfactor = (discountfactor/(1+discountrate));
        discountvalue = cashFromOperation*discountfactor;
        sumCashFromOperation += discountvalue;
      } else if (i >= 5 && i < 10){
        cashFromOperation = cashFromOperation * (1 + eps10yrs);
        discountfactor = (discountfactor/(1+discountrate));
        discountvalue = cashFromOperation*discountfactor;
        sumCashFromOperation += discountvalue;
      } else {
        cashFromOperation = cashFromOperation * (1 + eps20yrs);
        discountfactor = (discountfactor/(1+discountrate));
        discountvalue = cashFromOperation*discountfactor;
        sumCashFromOperation += discountvalue;
      }
    }

    const profit20yrs = Math.abs(Number(sumCashFromOperation)).toFixed(2);
    const intValbefDebt = Math.abs(Number(profit20yrs/shsOut)).toFixed(2);
    const lessdebtpershare = Math.abs(Number(totalDebt/shsOut)).toFixed(2);
    const pluscashpershare = Math.abs(Number(cshandShortTmInv/shsOut)).toFixed(2);
    const finalIntValBefDebt = Math.abs(Number((intValbefDebt-lessdebtpershare)+parseFloat(pluscashpershare)).toFixed(2));
    let premium = ((((parseFloat(prevClose) - finalIntValBefDebt)/finalIntValBefDebt).toFixed(2))*100);

    setValProfit20yrs(profit20yrs);
    setValintValbefDebt(intValbefDebt);
    setVallessdebtpershare(lessdebtpershare);
    setpluscashpershare(pluscashpershare);
    setfinalIntValBefDebt(finalIntValBefDebt);
    setPremium(premium);
  }

  function saveData() {



  }

  function formatDate(date) {
    var d = new Date(date),
      month = "" + (d.getMonth() + 1),
      day = "" + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;
    return [year, month, day].join("-");
  }

  //Return
  return (
    <>
      <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-100 border-0">
        <div className="rounded-t bg-white mb-0 px-6 py-6">
          <div className="text-center flex justify-between">
            <div className="w-full lg:w-6/12 px-4">
              <h6
                className="text-blueGray-700 text-xl font-bold"
                style={{ float: "left" }}
              >
                Intrinsic Value Calculator
              </h6>
            </div>
            <div className="w-full lg:w-6/12 px-4">
              <button
                className="bg-lightBlue-500 text-white active:bg-lightBlue-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 ease-linear transition-all duration-150"
                type="button"
                onClick={saveData}
                style={{ float: "right" }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
        <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
          <form>
            <h6 className="text-blueGray-400 text-sm mt-3 mb-6 font-bold uppercase">
              Stock Symbol
            </h6>
            <div className="flex flex-wrap">
              <div className="w-full lg:w-6/12 px-4">
                <div className="relative w-full mb-3">
                  <label
                    className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                    htmlFor="grid-password"
                  >
                    Symbol
                  </label>
                  <input
                    type="text"
                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    id="txtSymbol"
                  />
                </div>
              </div>
              <div className="w-full lg:w-6/12 px-4">
                <div className="relative w-full mb-3">
                  <label
                    className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                    htmlFor="grid-password"
                    hidden
                  >
                    Search
                  </label>
                  <button
                    className="bg-lightBlue-500 text-white active:bg-lightBlue-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 ease-linear transition-all duration-150"
                    type="button"
                    onClick={fetchStockData}
                  >
                    Search
                  </button>
                  {/* <label
                    className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                    htmlFor="grid-password"
                  >
                    Email address
                  </label>
                  <input
                    type="email"
                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    defaultValue="jesse@example.com"
                  /> */}
                </div>
              </div>
              {/* <div className="w-full lg:w-6/12 px-4">
                <div className="relative w-full mb-3">
                  <label
                    className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                    htmlFor="grid-password"
                  >
                    First Name
                  </label>
                  <input
                    type="text"
                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    defaultValue="Lucky"
                  />
                </div>
              </div>
              <div className="w-full lg:w-6/12 px-4">
                <div className="relative w-full mb-3">
                  <label
                    className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                    htmlFor="grid-password"
                  >
                    Last Name
                  </label>
                  <input
                    type="text"
                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    defaultValue="Jesse"
                  />
                </div>
              </div> */}
            </div>

            {/* Divider 2 -- Stock Information */}
            <div>
              <hr className="mt-6 border-b-1 border-blueGray-300" />

              <h6 className="text-blueGray-400 text-sm mt-3 mb-6 font-bold uppercase">
                Stock Information - {symbol || ""} | Previous CLose - {" "}
                {prevClose || ""}
              </h6>
              <div className="flex flex-wrap">
                <div className="w-full lg:w-3/12 px-4">
                  <div className="relative w-full mb-3">
                    <label
                      className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                      htmlFor="grid-password"
                    >
                      Operating Cashflow
                    </label>
                    <input
                      type="text"
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      value={cshFromOperation || ""} 
                      id="cshFromOperation"
                    />
                  </div>
                </div>
                <div className="w-full lg:w-3/12 px-4">
                  <div className="relative w-full mb-3">
                    <label
                      className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                      htmlFor="grid-password"
                    >
                      Total Debt
                    </label>
                    <input
                      type="text"
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      value={totalDebt || ""} onChange={debtHandler}
                    />
                  </div>
                </div>
                <div className="w-full lg:w-3/12 px-4">
                  <div className="relative w-full mb-3">
                    <label
                      className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                      htmlFor="grid-password"
                    >
                      Cash and Short Term Investment
                    </label>
                    <input
                      type="text"
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      value={cshandShortTmInv || ""} 
                    />
                  </div>
                </div>
                <div className="w-full lg:w-3/12 px-4">
                  <div className="relative w-full mb-3">
                    <label
                      className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                      htmlFor="grid-password"
                    >
                      Shares Outstanding
                    </label>
                    <input
                      type="text"
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      value={shsOut || ""} readOnly
                    />
                  </div>
                </div>
                <div className="w-full lg:w-3/12 px-4">
                  <div className="relative w-full mb-3">
                    <label
                      className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                      htmlFor="grid-password"
                    >
                      EPS 5 Years
                    </label>
                    <input
                      type="email"
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      id="eps5yrs"
                      onChange={eps5handler}
                    />
                  </div>
                </div>
                <div className="w-full lg:w-3/12 px-4">
                  <div className="relative w-full mb-3">
                    <label
                      className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                      htmlFor="grid-password"
                    >
                      EPS 6-10 Years
                    </label>
                    <input
                      type="text"
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      id="eps10yrs"
                    />
                  </div>
                </div>
                <div className="w-full lg:w-3/12 px-4">
                  <div className="relative w-full mb-3">
                    <label
                      className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                      htmlFor="grid-password"
                    >
                      EPS 11-20 Years
                    </label>
                    <input
                      type="text"
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      disabled defaultValue="4.18" 
                    />
                  </div>
                </div>
                <div className="w-full lg:w-3/12 px-4">
                  <div className="relative w-full mb-3">
                    <label
                      className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                      htmlFor="grid-password"
                    >
                      BETA
                    </label>
                    <input
                      type="text"
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      value={beta || ""} readOnly
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Divider 3 -- Intrinsic Value */}
            <hr className="mt-6 border-b-1 border-blueGray-300" />

            <h6 className="text-blueGray-400 text-sm mt-3 mb-6 font-bold uppercase">
              Intrinsic Value
            </h6>
            <div className="flex flex-wrap">
              <div className="w-full lg:w-4/12 px-4">
                <div className="relative w-full mb-3">
                  <label
                    className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                    htmlFor="grid-password"
                  >
                    Final Intrisic Value
                  </label>
                  <input
                    type="text"
                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    value={valfinalIntValBefDebt || ''} readOnly
                  />
                </div>
              </div>
              <div className="w-full lg:w-4/12 px-4">
                <div className="relative w-full mb-3">
                  <label
                    className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                    htmlFor="grid-password"
                  >
                    Premium
                  </label>
                  <input
                    type="text"
                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    style={{color: premium > 0 ? "red" : "green"}} 
                    value= { premium+'%'|| ''} readOnly
                  />
                </div>
              </div>
              <div className="w-full lg:w-4/12 px-4">
                <div className="relative w-full mb-3">
                  <button
                    className="bg-lightBlue-500 text-white active:bg-lightBlue-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 ease-linear transition-all duration-150"
                    type="button" style={{ float: "right" }}
                    onClick={calculateIntrinsicValue} 
                  >
                    Calculate
                  </button>
                </div>
              </div>
              <div className="w-full lg:w-3/12 px-4">
                  <div className="relative w-full mb-3">
                    <label
                      className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                      htmlFor="grid-password"
                    >
                      Profit over 20 years
                    </label>
                    <input
                      type="text"
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      value={valProfit20yrs||''} readOnly
                    />
                  </div>
                </div>
                <div className="w-full lg:w-3/12 px-4">
                  <div className="relative w-full mb-3">
                    <label
                      className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                      htmlFor="grid-password"
                    >
                      Intrinsic Value before Debt
                    </label>
                    <input
                      type="text"
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      value={valintValbefDebt || ''} readOnly
                    />
                  </div>
                </div>
                <div className="w-full lg:w-3/12 px-4">
                  <div className="relative w-full mb-3">
                    <label
                      className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                      htmlFor="grid-password"
                    >
                      Less Debt per Share
                    </label>
                    <input
                      type="text"
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      disabled value={vallessdebtpershare||''}  readOnly
                    />
                  </div>
                </div>
                <div className="w-full lg:w-3/12 px-4">
                  <div className="relative w-full mb-3">
                    <label
                      className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                      htmlFor="grid-password"
                    >
                      + Cash per Share
                    </label>
                    <input
                      type="text"
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      disabled
                      value={valpluscashpershare || ""} readOnly
                    />
                  </div>
                </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default SpecificStockDetails;
