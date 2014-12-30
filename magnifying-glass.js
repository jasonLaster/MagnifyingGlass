/*
 * Search adds a view mouse discovery tool. Once on,
 * any view you hover over will get a blue bounding box and on click
 * the view will be saved to window.view.
 *
 *
 */

;(function(root) {

  var mag = {}
  root.MagnifyingGlass = mag;

  mag.observedElements = [];

  /*
   * Search constructor starts the search mode
   *
   * @param {appObserver} - appObserver used to stop search
   */
  var Search = function(views) {
    this.addViewData(views);
    this.$clickMask = this.buildClickMask();
    this.searchEnabled = true;
    this.bindElEvents(views);
  };

  _.extend(Search.prototype, {

    bindElEvents: function(views) {
      var mouse_events = {
        'mouseover.regionSearch' : _.bind(this.onMouseOver, this),
        'mouseleave.regionSearch': _.bind(this.onMouseLeave, this),
        'mousedown.regionSearch' : _.bind(this.onMouseDown, this)
      };

      var $els = _.pluck(views, '$el');
      mag.observedElements = mag.observedElements.concat($els);

      _.each($els, function($el){
        $el.on(mouse_events);
      });
    },

    onMouseOver: function(e) {
      if (!this.searchEnabled) {
        return;
      }
      e.stopPropagation();
      var $current = $(e.currentTarget);
      mag.highlightEl($current);
    },

    onMouseLeave: function(e) {
      if (!this.searchEnabled) {
        return;
      }

      e.stopPropagation();
      var $current = $(e.currentTarget);
    },

    onMouseDown: function(e) {
      if (!this.searchEnabled) {
        return;
      }
      e.stopPropagation();
      var $current = $(e.currentTarget);
      this.placeClickElMask($current);

      this.searchEnabled = false;
      mag.stopSearch();

      return false;
    },

    /*
     * Creates a mask over the element which captures click events.
     * This is used because we don't want click events to on the view's
     * element to be captured.
     */
    buildClickMask: function() {
      var $clickMask = $('<div id="regionSearch-click-mask" style="position: absolute;">');
      $('body').prepend($clickMask);
      $clickMask.css('z-index', 10e10);

      return $clickMask;
    },

    placeClickElMask: function($el) {
      var $clickMask = this.$clickMask;

      $clickMask.offset($el.offset());
      $clickMask.height($el.outerHeight());
      $clickMask.width($el.outerWidth());

      $clickMask.on('click mouseup mouseout', function() {
        $clickMask.remove();
      });
    },

    addViewData: function(views) {
      _.each(views, function addCid(view) {
        view.$el.data('magnifying-glass', view.data);
      });
    }
  })

  mag.startSearch = function(views) {
    return new Search(views);
  }

  /*
   * stopSearch stops the magifying glass
   * it also unbinds all of the events and clears the observedElements cache
   *
   */
  mag.stopSearch = function() {
    _.each(mag.observedElements, function($el) {
      $el.off('.regionSearch');
      $el.removeAttr('data-view-id');
    });

    mag.observedElements = [];

    $(document).off('mouseleave');
    mag.unhighlightEl();
  };

  var createHighlightMask = function() {
    var $highlightMask = $('<div id="highlightMask" class="marionette-inspector-highlighted-element" style="position: absolute;">');
    $('body').prepend($highlightMask);
    $highlightMask.css('z-index', 10e10);

    mag.$highlightMask = $highlightMask;
  };

  $(document).ready(createHighlightMask);

  mag.highlightEl = function($el) {
    var $highlightMask = mag.$highlightMask;
    if (!$el || !$highlightMask) {
      return;
    }

    if (!($el instanceof jQuery)) {
      $el = $($el);
    }

    var isPresent = $highlightMask.offset() == $el.offset();
    if (isPresent && $highlightMask.is(":visible")) {
      return;
    }

    $highlightMask.css('display', 'block');
    $highlightMask.css('pointer-events', 'none')
    $highlightMask.offset($el.offset());
    $highlightMask.height($el.outerHeight());
    $highlightMask.width($el.outerWidth());
  };

  mag.unhighlightEl = function() {
    var $highlightMask = $(window.highlightMask);

    if (!$highlightMask) {
      return;
    }

    $highlightMask.css('display', 'none');
  };

}(this));

