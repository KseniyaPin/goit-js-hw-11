'use strict';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import ImagesApiService from './images-service';

const gallerySimple = new SimpleLightbox('.gallery a');
const imagesApiService = new ImagesApiService();

const form = document.getElementById('search-form');
const buttonSubmit = document.querySelector('button[type="submit"]');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = gallery.nextElementSibling;

window.addEventListener('scroll', smoothScrollGallery);

loadMoreBtn.classList.add('is-hidden');

// Submit - - - - - - - - - -

form.addEventListener('submit', onSearch);

function onSearch(evt) {
  evt.preventDefault();
  imagesApiService.query = form.elements.searchQuery.value.toLowerCase().trim();
  imagesApiService.resetLoadedHits();
  imagesApiService.resetPage();
  loadMoreBtnRemove();
  clearGellery();

  if (!imagesApiService.query) {
    return erorrQuery();
  }

  imagesApiService.fetchImages().then(({ hits, totalHits }) => {
    if (!hits.length) {
      loadMoreBtnRemove();
      return erorrQuery();
    }

    loadMoreBtnAdd();
    imagesApiService.addLoadedHits(hits);
    createGalleryMarkup(hits);
    accessQuery(totalHits);
    gallerySimple.refresh();

    if (hits.length === totalHits) {
      loadMoreBtnRemove();
      endOfSearch();
    }
  });
}

// Клик по кнопке Load more
loadMoreBtn.addEventListener('click', onLoadMore);

function onLoadMore() {
  loadMoreBtnRemove();

  imagesApiService
    .fetchImages()
    .then(({ hits, totalHits }) => {
      imagesApiService.addLoadedHits(hits);
      loadMoreBtnAdd();

      if (totalHits <= imagesApiService.loadedHits) {
        loadMoreBtnRemove();
        endOfSearch();
      }

      createGalleryMarkup(hits);
      gallerySimple.refresh();
    })
    .catch(() => erorrQuery()); //ЭТОТ
}

// Создаем разметку для галереи

function createGalleryMarkup(images) {
  const markup = images
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `
    <div class="photo-card">
      <a href="${webformatURL}">
        <img
          class="photo-card__img"
          src="${largeImageURL}"
          alt="${tags}"
          loading="lazy"
          width="320"
          height="212"
        />
      </a>
      <div class="info">
        <p class="info-item">
          <b>Likes</b>
          <span>${likes}</span>
        </p>
        <p class="info-item">
          <b>Views</b>
          <span>${views}</span>
        </p>
        <p class="info-item">
          <b>Comments</b>
          <span>${comments}</span>
        </p>
        <p class="info-item">
          <b>Downloads</b>
          <span>${downloads}</span>
        </p>
      </div>
    </div>
    `;
      }
    )
    .join('');

  gallery.insertAdjacentHTML('beforeend', markup);
}

// Плавный скрол

function smoothScrollGallery() {
  const { height } = gallery.firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: height * 2,
    behavior: 'smooth',
  });
}

// Очистка галереи
function clearGellery() {
  gallery.innerHTML = '';
}

// Сообщение об ошибке
function erorrQuery() {
  Notify.failure(
    'Sorry, there are no images matching your search query. Please try again.'
  );
}

// Кнопку Load more прячем
function loadMoreBtnRemove() {
  loadMoreBtn.classList.add('is-hidden');
}
// Добавляем кнопку Load more
function loadMoreBtnAdd() {
  loadMoreBtn.classList.remove('is-hidden');
}

// Количество найденных картинок
function accessQuery(totalHits) {
  Notify.success(`Hooray! We found ${totalHits} images.`);
}

// Закончить поиск
function endOfSearch() {
  Notify.info("We're sorry, but you've reached the end of search results.");
}
