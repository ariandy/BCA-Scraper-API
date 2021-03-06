let axios = require('axios');
let cheerio = require('cheerio');
let url = require('./url');

const scrapeTarget = `${url.target}`
axios.get(scrapeTarget)
    .then((response) => {
        if(response.status === 200) {
        const scraped = response.data;
        const $ = cheerio.load(scraped);
        let exchangeRateList = {};
        let dateObj = new Date
        let year = dateObj.getFullYear()
        let month = dateObj.getMonth()+1
        let day = dateObj.getDate()
        let newDateFormat = year + "-" + month + "-" + day
        let tagCrawl = $('tbody.text-right tr')

        tagCrawl.each(function(i, elements) {
            exchangeRateList[i] = {
                currency: $(this).find('td').eq(0).text(),
                eRate:{
                    Buy: $(this).find('td').eq(1).text(),
                    Sell: $(this).find('td').eq(2).text(),
                },
                ttCounter: {
                    Buy: $(this).find('td').eq(3).text(),
                    Sell: $(this).find('td').eq(4).text(),
                },
                bankNotes: {
                    Buy: $(this).find('td').eq(5).text(),
                    Sell: $(this).find('td').eq(6).text(),
                },
                date: newDateFormat
            }
        });
        console.log(exchangeRateList);
    }
}, (error) => console.log(err) );