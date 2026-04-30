import { api } from './src/lib/api.ts';

async function run() {
  try {
     const listings = await api.getListings();
     console.log("Listings:", listings);
     if (listings.length > 0) {
        await api.createOrder({ 
           listingId: listings[0].id, 
           consumerId: listings[0].farmerId, // just a valid user
           quantity_kg: 1, 
           delivery_address: 'test' 
        });
        console.log("Order created");
     }
  } catch (e) {
     console.error(e);
  }
}
run();
