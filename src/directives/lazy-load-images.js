import Vue from 'vue'

const config =  {

  // If the image gets within 100px in the Y axis, start the download.
  rootMargin: '0px 0px',

  threshold: 0.4

};

Vue.directive('lazy-load-image', {

  inserted: function (el) {

    el.classList.add('lazyload');

    el.parentNode.classList.add('image-loading-bg');

  },

  bind: function (el, binding, vnode) {

    let observer = new IntersectionObserver(onIntersection, config);

    function onIntersection(entries) {

      entries.forEach( entry => {

        if ( entry.intersectionRatio > 0.1 ) {

          entry.target.src = entry.target.dataset.src;

          entry.target.addEventListener('load', () =>{

            entry.target.classList.add('loaded');

            el.parentNode.classList.remove('image-loading-bg');


              // Identify image aspect ratio
              let ratio = entry.target.width / entry.target.height;

              el.classList.add((ratio < 1) ? 'portrait' : 'landscape');


              observer.unobserve(entry.target);

          })


        }

      });

    }

    observer.observe(el);

  }

});