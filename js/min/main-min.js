var db=openDatabase("traineeDB","1.0","Trainee DB",2097152),msg,topics,currentTopic="",prefix="NAVYTG";$.fn.animateOut=function(t,e){var i="webkitAnimationEnd";return t=t?t:"fadeOut",this.one(i,function(){$(this).hide(),$(this).removeClass(t+" animated"),e&&e.call(this)}),this.addClass("animated "+t),this},$.fn.animateIn=function(t,e){var i="webkitAnimationEnd";return t=t?t:"fadeIn",this.one(i,function(){$(this).removeClass(t+" animated"),e&&e.call(this)}),this.addClass("animated "+t).show(),this},$.fn.cascadeOut=function(t,e){var i=this.length-1,n=200;return this.each(function(o){var a=$(this);setTimeout(function(){e&&o===i?a.animateOut(t,e):a.animateOut(t)},n),n+=150}),this},$.fn.cascadeIn=function(t,e){var i=this.length-1,n=200;return this.each(function(o){var a=$(this);setTimeout(function(){e&&o===i?a.animateIn(t,e):a.animateIn(t)},n),n+=150}),this},db.transaction(function(t){t.executeSql("CREATE TABLE IF NOT EXISTS NOTES (ID INTEGER PRIMARY KEY ASC, title, note, modified DATETIME)")}),$.extend($.expr[":"],{containsIN:function(t,e,i,n){return(t.textContent||t.innerText||"").toLowerCase().indexOf((i[3]||"").toLowerCase())>=0}}),$(window).scroll(function(){var t=$(window).scrollTop();console.log(t),t>331?$(".utility").addClass("scroll-sticky"):$(".utility").removeClass("scroll-sticky")}),$(document).ready(function(){function t(t,e){return t.length>e&&(t=t.substr(0,e),t+="..."),t}function e(){$(".all-notes").empty(),db.transaction(function(e){e.executeSql("SELECT * FROM NOTES",[],function(e,i){var n=i.rows.length,o;for(msg="Found rows: "+n,console.log(msg),1===n?$("#notes-counter").text(n+" note"):$("#notes-counter").text(n+" notes"),o=0;n>o;o++){msg=i.rows.item(o).title,console.log(i.rows.item(o).ID,msg);var a='<a href="#" data-id="'+i.rows.item(o).ID+'" data-modified="'+i.rows.item(o).modified+'" class="note-link"><div class="note"><small class="date note-modified">'+i.rows.item(o).modified+"</small><h4>"+t(i.rows.item(o).title,40)+"</h4><p>"+t(i.rows.item(o).note,120)+"</p></div></a>";$(".all-notes").append($(a))}},null)})}function i(){function t(){$("[data-save]").each(function(){localStorage.setItem(prefix+"/"+currentTopic+"-"+$(this).attr("data-save"),$(this).val())})}function i(){$("[data-save]").each(function(){$(this).val(localStorage.getItem(prefix+"/"+currentTopic+"-"+$(this).attr("data-save")))})}function n(){$("#sectionNav").empty(),$("#portal [data-sectionTitle]").each(function(){var t='<li><a href="#" data-sectionTarget="'+$(this).attr("data-sectionTitle")+'"">'+$(this).attr("data-sectionTitle")+"</a></li>";$(t).appendTo("#sectionNav")}),$("#portal [data-sectionTitle]").length<=1?$(".sectionNav-button").hide():$(".sectionNav-button").show()}function o(){$.each(topics,function(t){var e='<li><a href="'+t+'" class="">'+this.title+"</a></li>";$(e).appendTo("#topicNav")}),c()}function a(t){currentTopic=t.id,$("#portal").load(t.location,function(){$("#topic-title").text(t.title),$(".hero").css("background-image","url('"+t.image+"')"),$('#portal [data-toggle="tooltip"]').tooltip(),$('#portal .tooltip-show[data-toggle="tooltip"]').tooltip("show"),i(),n(),$(window).scrollTop(0)})}function s(){var t=$("#portal").clone();t.find("input").each(function(){$(this).hasClass("inline-form")?$(this).replaceWith("[ANSWER: "+$(this).val()+"]]]"):$(this).replaceWith("[ANSWER: "+$(this).val()+"]")}),console.log(t);var e=t.text(),i=e.replace(/^[ \t\r]+\b/gm,"");e=i,i=e.replace(/^\s*?(?=\[)/gm,"\n"),e=i,i=e.replace(/\]\]\]\n/gm,"] "),e=i,i=e.replace(/^\s+$/gm,"\n"),e=i,i=e.replace(/^\n+/gm,"\n"),$(".exportContainer").html(i)}function c(){console.log("reset"),$("#topicNav-search").val(""),$("#topicNav li").show().removeClass("even"),$("#topicNav li:even").addClass("even")}e(),$(".save-note-button").click(function(){var t=$("#new-note-title").val(),i=$("#new-note-note").val(),n=new Date;db.transaction(function(o){o.executeSql("INSERT INTO NOTES (title, note, modified) VALUES (?,?,?)",[t,i,n.getMonth()+1+"/"+n.getDate()+"/"+n.getFullYear()],e)})}),$("#new-note, #edit-note").on("hidden.bs.modal",function(){$("#new-note .modal-input").val("")}),$(".all-notes").on("click","a",function(){var t=$(this).attr("data-id");db.transaction(function(e){e.executeSql("SELECT * FROM NOTES WHERE ID=?",[t],function(t,e){$("#edit-note-title").val(e.rows.item(0).title),$("#edit-note-note").val(e.rows.item(0).note),$(".edit-save-note-button").data("ID",e.rows.item(0).ID),$(".edit-delete-note-button").data("ID",e.rows.item(0).ID),$("#edit-note").modal()},null)})}),$(".edit-delete-note-button").click(function(){var t=$(this).data("ID");console.log(t),db.transaction(function(i){i.executeSql("DELETE FROM NOTES WHERE ID=?",[t],function(){e()})})}),$(".edit-save-note-button").click(function(){var t=$("#edit-note-title").val(),i=$("#edit-note-note").val(),n=$(this).data("ID");console.log(t,i,n),db.transaction(function(o){o.executeSql("UPDATE NOTES SET title=?, note=? WHERE ID=?",[t,i,n],e)})}),i(),$("#portal").on("keyup","[data-save]",function(){t()}),a(topics[0]),o(),$("#topicNav").on("click","a",function(){return a(topics[$(this).attr("href")]),$(this).addClass("selected").parent().siblings().children().removeClass("selected"),$(".topicNav-wrapper,.shroud").hide(),c(),!1}),$("#sectionNav").on("click","a",function(){var t=$(this);return $(window).scrollTop($('[data-sectionTitle="'+t.attr("data-sectionTarget")+'"]').offset().top-70),$("#sectionNav,.shroud").hide(),!1}),$("#search").keyup(function(){var t=$(this).val(),e=$(this);t.length>0?($("#portal").unhighlight().highlight(t),e.siblings(".fa").hide().siblings("#search-clear").show(),$("#search-count").text("Found "+$("#portal .highlight").length)):($("#portal").unhighlight(),$("#search-count").text(""),e.siblings("#search-clear").hide().siblings(".fa").show(),$("#search-count").text(""))}),$("#search-clear").click(function(){$("#search").val("").trigger("keyup")}),$("#export").click(function(){s()}),$(".copy-button").click(function(){return $(".exportContainer")[0].focus(),$(".exportContainer")[0].setSelectionRange(0,9999999),!1}),$(".sectionNav-button").click(function(){return $("#sectionNav, .shroud").toggle(),!1}),$(".topicNav-button").click(function(){return $(".topicNav-wrapper, .shroud").toggle(),!1}),$(window).click(function(){$("#sectionNav, .topicNav-wrapper").hide(),$(".shroud").hide(),c()}),$(".topicNav-search-wrapper").click(function(t){var e=$(t.target);e.is("#topicNav-search-clear")&&(c(),console.log("hi"),$("#topicNav-search-clear").hide().siblings(".fa").show()),t.stopPropagation()}),$("#topicNav-search").keyup(function(){""!=$("#topicNav-search").val()?($("#topicNav li").hide(),$('#topicNav li a:containsIN("'+$(this).val()+'")').parent().show(),$("#topicNav-search-clear").show().siblings(".fa").hide(),$("#topicNav li:visible:even").addClass("even"),$("#topicNav li:visible:odd").removeClass("even")):($("#topicNav li").show(),$("#topicNav-search-clear").hide().siblings(".fa").show(),c())})}FastClick.attach(document.body),$.getJSON("topics.json",function(t){topics=t,i()}),$.getJSON("help.json",function(t){$.each(t,function(){var t='<div class="help-item"><div class="help-question">'+this.question+'</div><div class="help-answer">'+this.answer+"</div></div>";$(t).appendTo(".help-items")}),$(".help-question").click(function(){$(this).toggleClass("open").siblings(".help-answer").toggle()}),$(".help-search").keyup(function(){""!=$(".help-search").val()?($(".help-item").hide(),$('.help-question:containsIN("'+$(".help-search").val()+'")').parent().show()):$(".help-item").show()})})});