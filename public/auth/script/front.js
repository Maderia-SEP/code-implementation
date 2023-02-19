let hotelurl;
hotelurl = 'http://localhost:3000/upload/';
JavaScript:

$(document).ready(() => {
  // fetch data from API and generate hotel cards
  fetch("http://localhost:3000/review/a",{
    method:'Put'
  })
    .then(response => response.json())
    .then(data => {
      const hotelCards = data.map(hotel => {
        // calculate star rating data
        const rating = hotel.averageRating;
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        // generate star rating HTML
        const starRatingHtml = `
          <div class="stars stars-${fullStars}${hasHalfStar ? " half" : ""}">
            ${Array(fullStars).fill().map(() => '<i class="fas fa-star"></i>').join("")}
            ${hasHalfStar ? '<i class="fas fa-star-half"></i>' : ""}
            ${Array(emptyStars).fill().map(() => '<i class="far fa-star"></i>').join("")}
          </div>
        `;
        // generate hotel card HTML

        return `
          <div class="col-12 col-md-6 col-lg-4">
            <div class="card">
              <img src="${hotelurl+hotel.hotel_image}" class="card-img-top" alt="${hotel.hotel_name}">
              <div class="card-body">
                <h5 class="card-title">${hotel.hotel_name}</h5>
                <p class="card-text">${hotel.user_name}</p>
                <div class="rating">${starRatingHtml}</div>
              </div>
            </div>
          </div>
        `;
      }).join("");
      // insert hotel cards into DOM
      $("#hotel-cards").html(hotelCards);
    });
});
