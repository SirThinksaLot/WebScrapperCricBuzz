"use strict";


let express = require('express');
let app = express();
let bodyParser = require('body-parser');
let request = require('request');
let cheerio = require('cheerio');
let stringify = require('csv-stringify');
let fs = require('fs');

let data = [];


app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine","ejs");


app.get('/scrap',function(req,res){
	res.render('Input');
})

app.post('/scrap',function(req,res){
	let played = 0;
	let won = 0;
	let lost = 0;
	let draw = 0;
	let columns = {
		played:'played',
		won:'won',
		lost:'lost',
		draw:'draw'

	}
	// let flag= 0;
	let year = req.body.year;
	let Tname = req.body.name;
	let url = "https://www.cricbuzz.com/cricket-scorecard-archives/"+year;
	let count  = 0 ;
	request(url,function(error,response,html){

		if(!error){
			let $ = cheerio.load(html);
			let len = $('.text-hvr-underline:first-child').length;
			$('.text-hvr-underline:first-child').each(function(e,i){
				let x = $(this);
				let p = x.attr('href');
				let vrl = 'https://www.cricbuzz.com'+ p; 
				let series = x.text();
				//Apply Filter
				let test1 = new RegExp(`tour of ${Tname}`);
				let test2 = new RegExp(`${Tname} tour of`);
				let test3 = new RegExp(`${Tname} in`);
				let test4 = new RegExp(`in ${Tname}`);
				let test5 = new RegExp(`v`);


				if((test3.test(series)||(test4.test(series)&&(!(series.includes('v')))))||(test1.test(series)||(test2.test(series)))||((series.includes('The Ashes'))&&(Tname==(('England'))||('Australia')))){
					request(vrl,function(error,response,html){
						if(!error){
							let $ = cheerio.load(html);
							$('.cb-text-link').each(function(h,j){
								
								let z = $(this);

								played++;
								
								
								if(z.text().includes('won')&& z.text().includes(Tname)){
									won++;
									
								} else if(z.text().includes('won')){
									lost++;
									
								}else {
									draw++ ;
									
								}
								console.log(`Played:${played} Won:${won} Lost:${lost} Draw:${draw}`);
								// +console.log(flag,len);
								data.push([played,won,lost, draw]);
								stringify(data, { header: true,columns:columns}, (err, output) => {
										  if (err) throw err;
										  fs.writeFile(`${Tname}.csv`, output, (err) => {
										    if (err) throw err;
										    console.log(`${Tname}.csv saved`);
										  });
										});

							})
						}
						
											

					});

				}

			});

		}

	});
	


});



app.listen(3000,()=>console.log('Server started'));