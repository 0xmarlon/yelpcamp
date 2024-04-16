const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');

main().catch((err) => console.log(err));

async function main() {
	await mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');
	console.log('MONGO CONNECTION IS OPEN!');
}

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
	await Campground.deleteMany({});
	for (let i = 0; i < 300; i++) {
		const random1000 = Math.floor(Math.random() * 1000 + 1);
		const price = Math.floor(Math.random() * 20) + 10;
		const camp = new Campground({
			author: '660eb6ae3631811fe19d579e',
			location: `${cities[random1000].city}, ${cities[random1000].state}`,
			title: `${sample(descriptors)} ${sample(places)}`,
			images: [
				{
					url: 'https://res.cloudinary.com/dblyh89fw/image/upload/v1712674846/YelpCamp/r4yjv2tx8ruanb1wesku.jpg',
					filename: 'YelpCamp/medxdmqg1dnfkvomio9a',
				},
				{
					url: 'https://res.cloudinary.com/dblyh89fw/image/upload/v1712674845/YelpCamp/mpirwvwjiwwnaeffgx9h.jpg',
					filename: 'YelpCamp/gnemb3djvtzesjzvucm8',
				},
			],
			description:
				'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Eligendi perspiciatis a omnis minus consequuntur velit commodi, nesciunt consequatur assumenda, consectetur sequi fugit cupiditate ipsa illo cum reiciendis quos dolor. Incidunt.',
			price: price,
			geometry: {
				type: 'Point',
				coordinates: [
					cities[random1000].longitude,
					cities[random1000].latitude,
				],
			},
		});
		await camp.save();
	}
};

seedDB().then(() => mongoose.connection.close());
