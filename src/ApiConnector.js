import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'https://www.alphavantage.co/query'
})

export const getStockOverview = (symbol) => {
    return axiosInstance.get('',{
        params:{
            function: 'OVERVIEW',
            symbol,
            apikey:'OTZ2LWGFB2KF4Q4C'
        }
    })
}

export const getStockCashFlow = (symbol) =>{
    return axiosInstance.get('',{
        params:{
            function: 'CASH_FLOW',
            symbol,
            apikey:'OTZ2LWGFB2KF4Q4C'
        }
    })
}

export const getStockBalanceSheet = (symbol) =>{
    return axiosInstance.get('',{
        params:{
            function: 'BALANCE_SHEET',
            symbol,
            apikey:'OTZ2LWGFB2KF4Q4C'
        }
    })
}

export const getStockPrice = (symbol) => {
    return axiosInstance.get('',{
        params:{
            function: 'TIME_SERIES_DAILY_ADJUSTED',
            symbol,
            apikey:'OTZ2LWGFB2KF4Q4C'
        }
    })
}