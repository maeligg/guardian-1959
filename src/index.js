import axios from "axios";
import "./styles.scss";

function importAll(r) {
  let images = {};
  r.keys().map((item, index) => {
    images[item.replace("./", "")] = r(item);
  });
  return images;
}

const images = importAll(
  require.context("./images", false, /\.(png|jpe?g|svg)$/)
);

const grid = document.querySelector(".js-grid");
const date = document.querySelector(".js-date");

// Generate the date for the header
const today = new Date();
const formattedToday = today.toLocaleString("en-GB", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric"
});
date.innerHTML = formattedToday;

// Pick random ads for the header
const adSlots = document.querySelectorAll(".js-ad-slot");
let firstAdNum;

adSlots.forEach(slot => {
  const ad = new Image();
  ad.src = Object.values(images)[Math.floor(Math.random() * 8)];

  slot.appendChild(ad);
});

// Get the data for each article and append them to the DOM
axios
  .get(
    "http://content.guardianapis.com/search?page-size=9&show-fields=body,thumbnail&api-key="
  )
  .then(response => {
    const data = response.data.response.results;

    data.forEach(article => {
      const content = article.fields.body;
      const gridItem = document.createElement("div");

      gridItem.classList.add("grid-item");
      gridItem.innerHTML = `<a href=${
        article.webUrl
      } target=_blank><h2 class="article-title">${
        article.webTitle
      }</h2><a>${content}`;
      grid.appendChild(gridItem);
    });

    // Replace the content of the second grid item by its thumbnail
    document.querySelector(".grid-item:nth-child(3)").innerHTML = `<img src=${
      data[1].fields.thumbnail
    }><a href=${data[1].webUrl} target=_blank><h2 class="article-title">${
      data[1].webTitle
    }</h2><a>`;
  })
  .catch(error => {
    const errorMessage = document.createElement("div");
    errorMessage.classList.add("error");
    errorMessage.innerHTML =
      "Sorry, something went wrong retrieving the data. Please try again";
    grid.appendChild(errorMessage);
  });
