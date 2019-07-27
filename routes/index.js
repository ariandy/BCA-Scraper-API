let express = require('express');
let router = express.Router();
let db = require('../config/db');
const Op = require('../models').Sequelize.Op;

let axios = require('axios');
let cheerio = require('cheerio');

let dateObj = new Date
let year = dateObj.getFullYear()
let month = dateObj.getMonth()+1
let day = dateObj.getDate()
let newDateFormat = year + "-" + month + "-" + day

let exchangeRateList = [];
const scrapeTarget = 'https://www.bca.co.id/id/Individu/Sarana/Kurs-dan-Suku-Bunga/Kurs-dan-Kalkulator'

scrapeData = async () => {
  await axios.get(scrapeTarget)
    .then((response) => {
      if(response.status === 200) {
        const scraped = response.data;
        const $ = cheerio.load(scraped);
        
        const tagCrawl = $('tbody.text-right tr')

        tagCrawl.each(function(i, elements) {
          td = $(this).find('td')
          exchangeRateList[i] = {
            currency: td.eq(0).text(),
            eRate:{
              Buy: td.eq(1).text().replace('.','').replace(',','.'),
              Sell: td.eq(2).text().replace('.','').replace(',','.'),
            },
            ttCounter: {
              Buy: td.eq(3).text().replace('.','').replace(',','.'),
              Sell: td.eq(4).text().replace('.','').replace(',','.'),
            },
            bankNotes: {
              Buy: td.eq(5).text().replace('.','').replace(',','.'),
              Sell: td.eq(6).text().replace('.','').replace(',','.'),
            },
            date: newDateFormat
          }
        })
      }
    }) 
    .catch(function (err) {
      console.log(err);
    })
} 

router.get('/', function(req, res, next) {
  res.render('index', { title: 'BCA Scraper' });
});

router.get('/test/:dateinput', async function(req, res, next) {
  try {
    const filteredByDate = await db.kurs.findAll({
      attributes : ['date'],
      where : {
        date : req.params.dateinput
      }
    }
    );
    if (filteredByDate.length !== 0) {
      res.json({
        'status': 'OK',
        'messages': '',
        'data': filteredByDate
      })
    } else {
      res.json({
        'status': 'ERROR',
        'messages': 'EMPTY',
      })
    }
  } catch (err) {
    console.log(err)
    res.json({
      'status': 'ERROR',
      'messages': err.messages,
      'data': {}
    })
  }
}); // for testing purpose

router.get('/api/indexing', async function(req, res, next){
  await scrapeData()
  
  const filteredByDate = await db.kurs.findAll({
    attributes : ['date'],
    where : {
      date : newDateFormat
    }
  })

  if (filteredByDate.length==0) {
    exchangeRateList.map((i, elements) => {
      db.kurs.create({
        currency : i.currency,
        eRateBuy : i.eRate.Buy,
        eRateSell: i.eRate.Sell,
        ttCounterBuy : i.ttCounter.Buy,
        ttCounterSell: i.ttCounter.Sell,
        bankNotesBuy : i.bankNotes.Buy,
        bankNotesSell: i.bankNotes.Sell,
        date: i.date
      }).then(() => {
        res.json(exchangeRateList).status(200)
      }).catch((err) => {
        res.json({"message":err.message})
      })
    })
  } else {
    res.json({"message":"Scraped data already stored",
  exchangeRateList})
  }

  
}) //1

// sequelize model:create --name kurs --attributes currency:string,eRateBuy:string,eRateSell:string,ttCounterBuy:string,ttCounterSell:string,date:string

router.delete('/api/kurs/:date', async function(req, res, next){
  // const date = req.params.date;
  // res.json({ message : date });
  try {
    const dateParams = req.params.date;
    const deleteByDate = await db.kurs.destroy({ where: {
      date: dateParams
    }})
    if (deleteByDate) {
      res.json({
        'status': 'OK',
        'messages': 'Deleted'
      })
    }
  } catch (err) {
    res.status(400).json({
      'status': 'ERROR',
      'messages': err.message,
    })
  }
}) //2

router.get('/api/kurs', async function(req, res, next){
  const startdate = req.query.startdate;
  const enddate = req.query.enddate;
  
  try {
    const filteredByDate = await db.kurs.findAll({
      where: {
        date : {
          [Op.between]: [startdate, enddate],
        }
      }
    });
    if (filteredByDate.length !== 0) {
      res.json({
        'status': 'OK',
        'messages': '',
        'data': filteredByDate
      })
    } else {
      res.json({
        'status': 'ERROR',
        'messages': 'EMPTY',
      })
    }
  } catch (err) {
    console.log(err)
    res.json({
      'status': 'ERROR',
      'messages': err.messages,
      'data': {}
    })
  }
}) //3

router.get('/api/kurs/:symbol', async function(req, res, next){
  const symbol = req.params.symbol;
  const startdate = req.query.startdate;
  const enddate = req.query.enddate;

  // res.json({symbol, startdate, enddate});
  try {
    const filteredByDate = await db.kurs.findAll({
      where: {
        currency : symbol,
        date : {
          [Op.between]: [startdate, enddate],
        }
      }
    });
    if (filteredByDate.length !== 0) {
      res.json({
        'status': 'OK',
        'messages': '',
        'data': filteredByDate
      })
    } else {
      res.json({
        'status': 'ERROR',
        'messages': 'EMPTY',
      })
    }
  } catch (err) {
    console.log(err)
    res.json({
      'status': 'ERROR',
      'messages': err.messages,
      'data': {}
    })
  }
}) //4

router.post('/api/kurs', async function(req, res, next){
  try{
    const currency = req.body.symbol;
    const e_rate_buy = req.body.e_rate.beli;
    const e_rate_sell = req.body.e_rate.jual;
    const tt_counter_buy = req.body.tt_counter.beli;
    const tt_counter_sell = req.body.tt_counter.jual;
    const bank_notes_buy = req.body.bank_notes.beli;
    const bank_notes_sell = req.body.bank_notes.jual;
    const date = req.body.date;
    
    const filteredByDateAndCurrency = await db.kurs.findAll({
      where : {
        currency : req.body.symbol,
        date : req.body.date
      }
    })

    if (filteredByDateAndCurrency == 0){
      const createKurs = await db.kurs.create({
        currency,
        eRateBuy: e_rate_buy,
        eRateSell: e_rate_sell,
        ttCounterBuy: tt_counter_buy,
        ttCounterSell: tt_counter_sell,
        bankNotesBuy: bank_notes_buy,
        bankNotesSell: bank_notes_sell,
        date
      })

      res.json({
        currency,
        "e_Rate" : {
          e_rate_buy,e_rate_sell,
        },
        "tt_Counter" : {
          tt_counter_buy,tt_counter_sell
        },
        "bank_Notes" : {
          bank_notes_buy,bank_notes_sell
        },
        date
      });
    } else {
      res.json({"message":"Already saved"})
    }
  } catch(err) {
    console.log(err)
    res.json({
      'status': 'ERROR',
      'messages': err.messages,
    })
  }
}) //5

router.put('/api/kurs', async function(req, res, next){
  try{
    const currency = req.body.symbol;
    const e_rate_buy = req.body.e_rate.beli;
    const e_rate_sell = req.body.e_rate.jual;
    const tt_counter_buy = req.body.tt_counter.beli;
    const tt_counter_sell = req.body.tt_counter.jual;
    const bank_notes_buy = req.body.bank_notes.beli;
    const bank_notes_sell = req.body.bank_notes.jual;
    const date = req.body.date;
    
    const filteredByDateAndCurrency = await db.kurs.findAll({
      where : {
        currency : req.body.symbol,
        date : req.body.date
      }
    })
    if (filteredByDateAndCurrency == 0) {
      res.json({"message":"404 Not Found"})
    } else {
      const updateKurs = await db.kurs.update({
        eRateBuy: e_rate_buy,
        eRateSell: e_rate_sell,
        ttCounterBuy: tt_counter_buy,
        ttCounterSell: tt_counter_sell,
        bankNotesBuy: bank_notes_buy,
        bankNotesSell: bank_notes_sell,
      },{ where : {
          currency : req.body.symbol,
          date : req.body.date
        }
      })
      res.json({
        currency,
        "e_Rate" : {
          e_rate_buy,e_rate_sell,
        },
        "tt_Counter" : {
          tt_counter_buy,tt_counter_sell
        },
        "bank_Notes" : {
          bank_notes_buy,bank_notes_sell
        },
        date
      });
    }
  } catch(err) {
    console.log(err)
    res.json({
      'status': 'ERROR',
      'messages': err.messages,
    })
  }
}) //6

module.exports = router;
