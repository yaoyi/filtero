// Caman.DEBUG = true
var ngCaman = angular.module('caman', [])
ngCaman.controller('CamanCtrl', ['$scope', function($scope) {
	$scope.brightness = 0
	$scope.contrast = 0
	$scope.vignette = 0
	$scope.lightenCenter = 0

	function createHoverState (myobject){
    myobject.hover(function() {
      $(this).prev().toggleClass('hilite');
    });
    myobject.mousedown(function() {
      $(this).prev().addClass('dragging');
      $("*").mouseup(function() {
        $(myobject).prev().removeClass('dragging');
      });
    });
  }

  function updateState(){
  	console.log('hello')
  	var name = $(this).attr('name')
  	var value = $(this).slider("value")

  }
}])


var busy, caman, changed, filters, presetBusy, presetCaman, render, renderPreset,
  __hasProp = {}.hasOwnProperty;

caman = null;

presetCaman = null;

filters = {};
prefs = {}

busy = false;

changed = false;

render = _.throttle(function() {
  if(!caman){
    alert('please drag in one photo first')
    return
  }

  var filter, value;
  if (busy) {
    changed = true;
    return;
  } else {
    changed = false;
  }
  busy = true;
  caman.revert(false);
  for (filter in filters) {
    if (!__hasProp.call(filters, filter)) continue;
    if(filter == 'vignette'){
      value = filters[filter];
      caman[filter](value['size'] + '%', value['strength']);
    }
    else{
      value = filters[filter];
      if(filter != 'tint'){
        value = parseFloat(value, 10);
      }

      if (value === 0) {
        continue;
      }
      caman[filter](value);
    }

  }
  return caman.render(function() {
    busy = false;
    if (changed) {
      return render();
    }
  });
}, 300);

$(function() {
  $('.reset').click(function(){
    filters = {}
    $('.FilterSetting input').each(function() {
      var filter;
      filter = $(this).data('filter');
      if(filter == 'tint'){
        var name = $(this).data('name');
        filters[filter] = filters[filter] || []
        filters[filter][name] = 0
      }else{
        filters[filter] = $(this).val();
      }
      $(this).find('~ .FilterValue').html(0);
      return filters[filter]
    });
    $('input[type="range"]').val(0)
    caman.revert()
  })

  $('select[name="curves"]').change(function(){
    console.log('changed')
    var filter
    switch(this.value){
      case 'none':
        filters['retro'] = 0
        filters['greenish'] = 0
        filters['reddish'] = 0
        render()
        break;
      case '1':
        filter = 'retro'
        filters[filter] = 1
        render()
        break;
      case '2':
        filter = 'greenish'
        filters[filter] = 1
        render()
        break;
      case '3':
        filter = 'reddish'
        filters[filter] = 1
        render()
        break;
    }
  })

  $('select[name="custom-filter"]').change(function(){
    if(this.value == "none"){
      $('.reset').click()
      return
    }

    filters = prefs[this.value]
     $('.FilterSetting input').each(function() {
        var filter;
        filter = $(this).data('filter');
        $(this).find('~ .FilterValue').html(filters[filter]);
        $('input[data-filter="' + filter + '"]').val(filters[filter])
        if(filter == 'retro' || filter == 'greenish' || filter == 'reddish'){
          if(filters[filter] == 1){
            $('select[name="curves"]').val()
          }
        }
        render()
     })

     var data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filters));
     $('.export a').attr('href', 'data:' + data)
     $('.export a').attr('download', this.value + '.json')
  })

  $('#picker').colpick({
    layout:'hex',
    submit:0,
    colorScheme:'dark',
    onChange:function(hsb,hex,rgb,el,bySetColor) {
      $(el).css('border-color','#'+hex);
      // Fill the text box just if the color was set using the picker, and not the colpickSetColor function.
      if(!bySetColor) $(el).val(hex);
        var filter = 'tint'
        filters[filter] = hex
        render()


    }
  }).keyup(function(){
    $(this).colpickSetColor(this.value);
  });


  $('.save').click(function(){
    var title = prompt("Please enter filter name", "");
    if (title != null && title != "") {
      prefs[title] = filters
      window.localStorage.setItem('fo_filters', JSON.stringify(prefs))
      var option = '<option value="' + title + '">' + title + '</option>'
      var select = $('select[name="custom-filter"]')
      select.append(option)
    }

  })

  function fillCustomFilters(){
    var select = $('select[name="custom-filter"]')
    select.html('')
    var option = '<option value="none">none</option>'
    select.append(option)
    for(key in prefs){
      var option = '<option value="' + key + '">' + key + '</option>'
      select.append(option)
    }
  }

  prefs = window.localStorage.getItem('fo_filters')
  prefs = JSON.parse(prefs) || {}
  fillCustomFilters()

  Caman.Filter.register("reddish", function(adjust){
        this.vignette("60%",30)
        this.newLayer(function() {
            this.setBlendingMode("screen");
            this.opacity(15)
            return this.fillColor(255, 0, 0);
        });
        var c = {r:[],g:[],b:[]};
        var rgb = function(x){
          return -12 * Math.sin( x * 2 * Math.PI / 255 ) + x;
        }
        for(var i=0;i<=255;++i) {
              c.r[i] = rgb(i);
              c.g[i] = rgb(i);
              c.b[i] = rgb(i);
          }
        return this.process("reddish", function(rgba){
          rgba.r = c.r[rgba.r]
          rgba.g = c.g[rgba.g]
          rgba.b = c.b[rgba.b]

          return rgba
        })
      });

      Caman.Filter.register("greenish", function(adjust){
        this.vignette("60%",30)
        this.newLayer(function() {
            this.setBlendingMode("screen");
            this.opacity(15)
            return this.fillColor(255, 255, 0);
        });

        var c = {r:[],g:[],b:[]};
        var rgb = function(x){
          return -12 * Math.sin( x * 2 * Math.PI / 255 ) + x;
        }
        for(var i=0;i<=255;++i) {
              c.r[i] = rgb(i);
              c.g[i] = rgb(i);
              c.b[i] = rgb(i);
          }
        return this.process("greenish", function(rgba){
          rgba.r = c.r[rgba.r]
          rgba.g = c.g[rgba.g]
          rgba.b = c.b[rgba.b]

          return rgba
        })
      });

      Caman.Filter.register("retro", function(adjust){
        var rgb = function(x){
          return -12 * Math.sin( x * 2 * Math.PI / 255 ) + x;
        }

        var rgb_r = function(x){
          return -.2 * Math.pow(255 * x, .5) * Math.sin(Math.PI * (-195e-7 * Math.pow(x, 2) + .0125 * x)) + x
        }

        var rgb_g = function(x){
          return -.001045244139166791 * Math.pow(x, 2) + 1.2665372554875318 * x
        }

        var rgb_b = function(x){
          return .57254902 * x + 53
        }
        var c = {r:[],g:[],b:[]};
        for(var i=0;i<=255;++i) {
              c.r[i] = rgb_r(rgb(i));
              c.g[i] = rgb_g(rgb(i));
              c.b[i] = rgb_b(rgb(i));
          }
        return this.process('retro', function(rgba){
          rgba.r = c.r[rgba.r]
          rgba.g = c.g[rgba.g]
          rgba.b = c.b[rgba.b]
          return rgba
        })
      })
  Caman.Filter.register("tint", function(adjust){
        var rgb, cmyk;
        if (arguments.length === 3){
          rgb = {
            r: 255 * (100 - arguments[0])/100,
            g: 255 * (100 - arguments[1])/100,
            b: 255 * (100 - arguments[2])/100
          }
        }
        if (arguments.length === 1){
          rgb = Caman.Convert.hexToRGB(arguments[0])
        }
        console.log(rgb)
        this.greyscale()
        this.newLayer(function() {
              this.setBlendingMode("multiply");
              return this.fillColor(rgb.r, rgb.g, rgb.b);
        });
        return this
  })

  Caman.Filter.register("atint", function(adjust){
    var mode = arguments[0]
    var color = arguments[1]
    var opacity = arguments[2]

    this.newLayer(function() {
        this.setBlendingMode(mode);
        this.opacity(opacity)
        return this.fillColor(color);
    });
  })

  $('.FilterSetting input').each(function() {
    var filter;
    filter = $(this).data('filter');
    if(filter == 'tint' || filter == 'vignette'){
      var name = $(this).data('name');
      filters[filter] = filters[filter] || {}
      filters[filter][name] = parseInt($(this).val())
    }else{
      filters[filter] = $(this).val();
    }
    return filters[filter]
  });
  $('#Filters').on('change', '.FilterSetting input', function() {
    var filter, value;
    filter = $(this).data('filter');
    value = $(this).val();
    if(filter == 'tint' || filter == 'vignette'){
      var name = $(this).data('name');
      filters[filter] = filters[filter] || {}
      filters[filter][name] = parseInt(value);
    }
    else{
      filters[filter] = value;
    }

    $(this).find('~ .FilterValue').html(value);
    return render();
  });

  var data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(prefs));
  $('<li><span class="export btn"><a href="data:' + data + '" download="filters.json">Export Custom Filter</a></span></li>').appendTo('ul.cta');

  var JsonObj = null;

function handleFileSelect(evt) {
    var files = evt.target.files; // FileList object
    f = files[0];
    var reader = new FileReader();

    reader.onload = (function (theFile) {
        return function (e) {
            JsonObj = e.target.result
            prefs = JSON.parse(JsonObj);
            window.localStorage.setItem('ur_filters', JSON.stringify(prefs))
            fillCustomFilters()
        };
    })(f);

    // Read in JSON as a data URL.
    reader.readAsText(f, 'UTF-8');
}



document.getElementById('files').addEventListener('change', handleFileSelect, false);
});


var holder = document.getElementById('holder')

function previewfile(file) {
  var reader = new FileReader();
  reader.onload = function (event) {
    var image = new Image();
    image.src = event.target.result;
    image.id = 'example'
    holder.style.border = "none"
		holder.innerHTML = "";
    holder.appendChild(image);
    caman = Caman('#example', function(){
    	this.resize({
    		width: 400
    	})
    	this.render();
    });
  };

  reader.readAsDataURL(file);
}

function readfiles(files) {
    for (var i = 0; i < files.length; i++) {
      previewfile(files[i]);
    }
}

holder.ondragover = function () { this.className = 'hover'; return false; };
holder.ondragend = function () { this.className = ''; return false; };
holder.ondrop = function (e) {
  this.className = '';
  e.preventDefault();
  holder.innerHTML = "";
  previewfile(e.dataTransfer.files[0]);
}

$('input#file').change(function(){
	readfiles(this.files)
	return
})
