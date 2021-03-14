const { tradeType } = require('./enums');

exports.buyShare = (user, tradeRequest) => {
  const {portfolios} = user;
  // console.log('Inside buynewsjare');
  portfolios.forEach(security => {
    if (security.ticker_symbol === tradeRequest.ticker_symbol) {
      const updatedShares = security.shares + tradeRequest.shares;
      const updatedTradeprice = ((tradeRequest.trade_price * tradeRequest.shares) + (security.average_trade_price * security.shares)) / updatedShares;
      security['shares'] = updatedShares;
      security['average_trade_price'] = updatedTradeprice;
      return;
    }
  });
  user['portfolios'] = portfolios;
  return user;
}

exports.sellShare = (user, tradeRequest) => {
  const newPortfolios = user.portfolios;
  // console.log('Inside sellshare');
  newPortfolios.forEach((security) => {
    if (security.ticker_symbol === tradeRequest.ticker_symbol) {
      const updatedShares = security.shares - tradeRequest.shares;

      security['shares'] = updatedShares;
      return;
    }
  });

  user['portfolios'] = newPortfolios;
  return user;
}

exports.addNewSecurity = (user, tradeRequest) => {
  // console.log('insidenewsec', user, tradeRequest);
  const {portfolios} = user;
  const newSecurity = {
    name: tradeRequest.name || '',
    ticker_symbol: tradeRequest.ticker_symbol,
    shares: tradeRequest.shares,
    average_trade_price: (tradeRequest.trade_price * tradeRequest.shares) / tradeRequest.shares
  }
  portfolios.push(newSecurity);
  user['portfolios'] = portfolios;
  return user;
}

exports.findSecurity = (portfolios, tradeRequest) => {
  const foundPortfolio = portfolios.find(security => {
    return security.ticker_symbol === tradeRequest.ticker_symbol;
  });
  return foundPortfolio || [];
}

exports.calculateReturn = (portfolio) => {

  const curentPrice = 100;
  let totalReturn = portfolio.reduce((sum, security) => {
    return sum + ((curentPrice - security.average_trade_price) * security.shares)
  }, 0);
  return totalReturn;
}

exports.removeTrade = (user, tradeRequest) => {
  const newPortfolio = user.portfolios;

  newPortfolio.forEach(security => {
    if (security.ticker_symbol === tradeRequest.ticker_symbol) {
      if (tradeRequest.type === tradeType.sell) {
        const updatedShares = security.shares + tradeRequest.shares;
        security['shares'] = updatedShares;
        return;
      }

      if (tradeRequest.type === tradeType.buy) {
        let updatedShares = security.shares - tradeRequest.shares;
        let updatedTradeprice = ((security.average_trade_price * security.shares) - (tradeRequest.trade_price * tradeRequest.shares)) / updatedShares;

        if (updatedShares === 0) {
          updatedTradeprice = security.average_trade_price;
        }
        security['shares'] = updatedShares;
        security['average_trade_price'] = updatedTradeprice;
        return;
      }
    }
  });
  user['portfolios'] = newPortfolio;
  return user;
}