// ===========================================
//            VARIABLES
// ===========================================

var db = openDatabase('traineeDB', '1.0', 'Trainee DB', 2 * 1024 * 1024);
var msg;
var topics;
var currentTopic='';
var prefix='NAVYTG';
var bookmarks;







// ===========================================
//            PLUGINS
// ===========================================

$.fn.animateOut = function(animation,callback){
	var events='webkitAnimationEnd';
	animation=animation?animation:'fadeOut';

	this.one(events,function(){
		$(this).hide();
		$(this).removeClass(animation+' animated');
		if(callback){
			callback.call(this);
		}
	});
	this.addClass('animated '+animation);
	return this;
};


$.fn.animateIn = function(animation,callback){
	var events='webkitAnimationEnd';
	animation=animation?animation:'fadeIn';

	this.one(events,function(){
		$(this).removeClass(animation+' animated');
		if(callback){
			callback.call(this);
		}
	});
	this.addClass('animated '+animation).show();
	return this;
};

$.fn.cascadeOut = function(animation,callback){

	var lastIndex=this.length-1;
	var time=200;

	this.each(function(index){

		var currentEl=$(this);
		setTimeout(function(){
			if(callback&&index===lastIndex){
				currentEl.animateOut(animation,callback);
			}
			else{
				currentEl.animateOut(animation);
			}

		},time);
		time+=150;
	});
	return this;
};

$.fn.cascadeIn = function(animation,callback){

	var lastIndex=this.length-1;
	var time=200;

	this.each(function(index){

		var currentEl=$(this);
		setTimeout(function(){
			if(callback&&index===lastIndex){
				currentEl.animateIn(animation,callback);
			}
			else{
				currentEl.animateIn(animation);
			}

		},time);
		time+=150;
	});
	return this;
};

//PLUGIN::containsIN
$.extend($.expr[":"], {
	"containsIN": function(elem, i, match, array) {
		return (elem.textContent || elem.innerText || "").toLowerCase().indexOf((match[3] || "").toLowerCase()) >= 0;
	}
});

function truncateTo(text,len){
	if (text.length>len){
		text=text.substr(0,len);
		text=text+'...';
	}
	return text;
}









$(document).ready(function(){

	//implement fastclick
	FastClick.attach(document.body);






	// ===========================================
	//            LOAD DATA
	// ===========================================

	//retrieve localstorage
	if(localStorage.getItem('navyTG-bookmarks')){
		bookmarks=JSON.parse(localStorage.getItem('navyTG-bookmarks'));
	}
	else{
		bookmarks=[];
	}

	//db init
	db.transaction(function (tx) {
		tx.executeSql('CREATE TABLE IF NOT EXISTS NOTES (ID INTEGER PRIMARY KEY ASC, title, note, modified DATETIME)');
	});

	//refresh notes pane from db
	function refreshNotes(){
		$('.all-notes').empty();
		db.transaction(function (tx) {   
			tx.executeSql('SELECT * FROM NOTES', [], function (tx, results) {
				var len = results.rows.length, i;
				msg = "Found rows: " + len;

				if(len===1){
					$('#notes-counter').text(len+' note');
				}
				else{
					$('#notes-counter').text(len+' notes');
				}


				for (i = 0; i < len; i++){
					msg = results.rows.item(i).title;

					var newNote='<a href="#" data-id="'+results.rows.item(i).ID+'" data-modified="'+results.rows.item(i).modified+'" class="note-link">'+
					'<div class="note">'+
					'<small class="date note-modified">'+results.rows.item(i).modified+'</small>'+
					'<h4>'+truncateTo(results.rows.item(i).title,40)+'</h4>'+
					'<p>'+truncateTo(results.rows.item(i).note,120)+'</p>'+
					'</div>'+
					'</a>';
					$('.all-notes').append($(newNote));

				}
			}, null);
		});
	}


	//load data
	$.getJSON('topics.json',function(data){
		topics=data;
		startGuide();
	});

	//help accordions 
	$.getJSON('help.json',function(data){
		$.each(data,function(){
			var newHelp='<div class="help-item">'+
			'<div class="help-question">'+
			this.question +
			'</div>' +
			'<div class="help-answer">'+
			this.answer +
			'</div>' +
			'</div>';

			$(newHelp).appendTo('.help-items');
		});

		$('.help-question').click(function(){
			$(this).toggleClass('open').siblings('.help-answer').toggle();
		});

		//catalog search
		$('.help-search').keyup(function(){
			if($('.help-search').val()!=''){
				$('.help-item').hide();
				$('.help-question:containsIN("'+$('.help-search').val()+'")').parent().show();
			}
			else{
				$('.help-item').show();
			}

		});
	});









	function startGuide(){
		refreshNotes();

		// ===========================================
		//            NOTES
		// ===========================================

		//save new note
		$('.save-note-button').click(function(){
			var title=$('#new-note-title').val();
			var note=$('#new-note-note').val();
			var modified = new Date();

			db.transaction(function (tx) {
				tx.executeSql('INSERT INTO NOTES (title, note, modified) VALUES (?,?,?)',[title,note,(modified.getMonth()+1)+'/'+modified.getDate()+'/'+modified.getFullYear()],refreshNotes);
			});
		});

		//clear notes modal on hide
		$('#new-note, #edit-note').on('hidden.bs.modal',function(){
			$('#new-note .modal-input').val('');
		});


		//open edit note modal
		$('.all-notes').on('click','a',function(){
			var id=$(this).attr('data-id');

			db.transaction(function (tx) {   
				tx.executeSql('SELECT * FROM NOTES WHERE ID=?', [id], function (tx, results) {
					$('#edit-note-title').val(results.rows.item(0).title);
					$('#edit-note-note').val(results.rows.item(0).note);
					$('.edit-save-note-button').data('ID',results.rows.item(0).ID);
					$('.edit-delete-note-button').data('ID',results.rows.item(0).ID);
					$('#edit-note').modal();
				}, null);
			});      
		});

		//delete note button
		$('.edit-delete-note-button').click(function(){
			var ID=$(this).data('ID');

			db.transaction(function (tx) {
				tx.executeSql('DELETE FROM NOTES WHERE ID=?',[ID],function(){
					refreshNotes();
				});
			});
		});

		//save edited note
		$('.edit-save-note-button').click(function(){
			var title=$('#edit-note-title').val();
			var note=$('#edit-note-note').val();
			var ID=$(this).data('ID');

			db.transaction(function (tx) {
				tx.executeSql('UPDATE NOTES SET title=?, note=? WHERE ID=?',[title,note,ID],refreshNotes);
			});
		});







		// ===========================================
		//            STUDY QUESTIONS
		// ===========================================

		//save study questions
		function saveStudy(){
			$('[data-save]').each(function(){
				localStorage.setItem(prefix+'/'+currentTopic+'-'+$(this).attr('data-save'),$(this).val());
			});
		}

		//restore saved study questions
		function restoreStudy(){
			$('[data-save]').each(function(){
				$(this).val(localStorage.getItem(prefix+'/'+currentTopic+'-'+$(this).attr('data-save')));
			});
		}
		restoreStudy();

		//save study guides
		$('#portal').on('keyup','[data-save]',function(){
			saveStudy();
		});







		



		// ===========================================
		//            NAVIGATION
		// ===========================================

		//generate section navigation
		function generateSectionNav(){
			$('#sectionNav').empty();
			$('#portal [data-sectionTitle]').each(function(){
				var newNavPoint='<li><a href="#" data-sectionTarget="'+$(this).attr('data-sectionTitle')+'"">'+$(this).attr('data-sectionTitle')+'</a></li>';
				$(newNavPoint).appendTo('#sectionNav');
			});
			if($('#portal [data-sectionTitle]').length<=1){
				$('.sectionNav-button').hide();
			}
			else{
				$('.sectionNav-button').show();
			}
		}

		//generate topic navigation
		function generateTopicNav(){

			$.each(topics,function(index){
				var newTopicNav='<li><a href="'+index+'" class="" data-topic="'+this.id+'">'+this.title+'</a></li>';
				$(newTopicNav).appendTo('#topicNav');
			});

			resetTopicNav();
		}

		//function to load new topics
		function loadTopic(topic){
			currentTopic=topic.id;
			$('#portal').load(topic.location,function(){
				$('#topic-title').text(topic.title);
				$('.hero').css('background-image','url(\''+topic.image+'\')');
				$('#portal [data-toggle="tooltip"]').tooltip();
				$('#portal .tooltip-show[data-toggle="tooltip"]').tooltip('show');

				restoreStudy();
				evalBookmarks();
				generateSectionNav();
				$(window).scrollTop(0);
			});
		}

		//load initial content
		loadTopic(topics[0]);

		//generate topics list
		generateTopicNav();

		//click handler for topic navigation
		$('#topicNav').on('click','a',function(){
			loadTopic(topics[$(this).attr('href')]);
			$(this).addClass('selected').parent().siblings().children().removeClass('selected');
			$('.topicNav-wrapper,.shroud').hide();
			resetTopicNav();
			return false;
		});

		//click handler for section navigation
		$('#sectionNav').on('click','a',function(){
			var el=$(this);

			$(window).scrollTop($('[data-sectionTitle="'+el.attr('data-sectionTarget')+'"]').offset().top-70);
			$('#sectionNav,.shroud').hide();

			return false;

		});

		//sectionNav button
		$('.sectionNav-button').click(function(){
			$('#sectionNav, .shroud').toggle();
			return false;
		});

		//topicNav button
		$('.topicNav-button').click(function(){
			$('.topicNav-wrapper, .shroud').toggle();
			return false;
		});

		//clicks to window clear nav dropdowns
		$(window).click(function() {
			$('#sectionNav, .topicNav-wrapper').hide();
			$('.shroud').hide();
			resetTopicNav();
		});





		// ===========================================
		//            SEARCH
		// ===========================================

		//search highlight
		$('#search').keyup(function(){
			var query=$(this).val();
			var el=$(this);


			if(query.length>0){
				$('#portal').unhighlight().highlight(query);

				el.siblings('.fa').hide().siblings('#search-clear').show();
				$('#search-count').text('Found '+$('#portal .highlight').length);
			}
			else{
				$('#portal').unhighlight();
				$('#search-count').text('');
				el.siblings('#search-clear').hide().siblings('.fa').show();
				$('#search-count').text('');
			}


		});

		//clear search
		$('#search-clear').click(function(){
			$('#search').val('').trigger('keyup');
		});





		// ===========================================
		//            EXPORT
		// ===========================================

		//exports portal content as copyable
		function exportPortal(){

		//clone portal content
		var clone=$('#portal').clone();
		//clone.text(($('#topic-title').text()+'\n'+clone.text()));
		//process answers and insert as text
		clone.find('input').each(function(){
			if($(this).hasClass('inline-form')){
				$(this).replaceWith('[ANSWER: '+$(this).val()+']]]');
			}
			else{
				$(this).replaceWith('[ANSWER: '+$(this).val()+']');
			}

		});


		//remove whitespaces
		var oldString=clone.text();
		var newString=oldString.replace(/^[ \t\r]+\b/gm,'');

		oldString=newString;
		newString=oldString.replace(/^\s*?(?=\[)/gm,'\n');

		oldString=newString;
		newString=oldString.replace(/\]\]\]\n/gm,'\] ');

		oldString=newString;
		newString=oldString.replace(/^\s+$/gm,'\n');

		oldString=newString;
		newString=oldString.replace(/^\n+/gm,'\n');

		//console.log(newString);

		//insert processed text into export textarea
		$('.exportContainer').html(newString);


		}

		//export button triggers export function
		$('#export').click(function(){
			exportPortal();
		});

		//select all exportable text
		$('.copy-button').click(function(){
			$('.exportContainer')[0].focus();
			$('.exportContainer')[0].setSelectionRange(0,9999999);
			return false;

		});







		// ===========================================
		//            TOPIC SEARCH
		// ===========================================


		//topic search/filter
		$('#topicNav-search').keyup(function(){

			if($('#topicNav-search').val()!=''){
				$('#topicNav li').hide();
				$('#topicNav li a:containsIN("'+$(this).val()+'")').parent().show();
				$('#topicNav-search-clear').show().siblings('.fa').hide();
				$('#topicNav li:visible:even').addClass('even');
				$('#topicNav li:visible:odd').removeClass('even');
			}
			else{
				$('#topicNav li').show();
				$('#topicNav-search-clear').hide().siblings('.fa').show();
				resetTopicNav();
			}

		});

		//maintain clicks to search wrapper
		$('.topicNav-search-wrapper').click(function(event){
			var targ=$(event.target);

			//if click to search clear button, clear search box
			if(targ.is('#topicNav-search-clear')){
				resetTopicNav();
				$('#topicNav-search-clear').hide().siblings('.fa').show();
			}

			event.stopPropagation();
		});

		//reset topic nav textbox value and list items
		function resetTopicNav(){
			$('#topicNav-search').val('');
			$('#topicNav li').show().removeClass('even');
			$('#topicNav li:even').addClass('even');

			$('.topicNav-bookmarks-btn').removeClass('filter-selected');
			$('#topicNav-search').removeAttr('disabled');
		}







		// ===========================================
		//            BOOKMARKS
		// ===========================================

		//evaluate bookmark button status
		function evalBookmarks(){
			if(bookmarks.indexOf(currentTopic)==-1){
				$('.bookmark-toggle-btn').removeClass('bookmarked');
			}
			else{
				$('.bookmark-toggle-btn').addClass('bookmarked');
			}

			$('#topicNav li a').each(function(){
				if(bookmarks.indexOf($(this).attr('data-topic'))==-1){
					$(this).removeClass('bookmarked');
				}
				else{
					$(this).addClass('bookmarked');
				}
			});
		}


		//bookmark toggle
		$('.bookmark-toggle-btn').click(function(){
			if($(this).hasClass('bookmarked')){
				bookmarks.splice(bookmarks.indexOf(currentTopic),1);
			}
			else{
				bookmarks.push(currentTopic);
			}
			evalBookmarks();
			localStorage.setItem('navyTG-bookmarks',JSON.stringify(bookmarks));

			return false;
		});

		//bookmark filter{
		$('.topicNav-bookmarks-btn').click(function(){
			$(this).toggleClass('filter-selected');

			if($(this).hasClass('filter-selected')){
				$('#topicNav-search').attr('disabled','disabled');
				$('#topicNav li').hide();
				$('#topicNav li a.bookmarked').parent().show();
			}
			else{
				$('#topicNav-search').removeAttr('disabled');
				$('#topicNav li').show();
			}

			

			return false;
		});

	}

});





// ===========================================
//            STICKY SCROLLING
// ===========================================

$(window).scroll(function(){
	var scrolled=$(window).scrollTop();

	if(scrolled>270){
		$('.utility').addClass('scroll-sticky');
	}
	else{
		$('.utility').removeClass('scroll-sticky');
	}

});