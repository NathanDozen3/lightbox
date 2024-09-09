(function() {

	const i18n = {
		"es": {
			"Close": "Cerrar",
			"Next": "Próximo",
			"Previous": "Previo"
		},
		"fr": {
			"Close": "Fermer",
			"Next": "Suivant",
			"Previous": "Précédent"
		},
		"it": {
			"Close": "Chiudere",
			"Next": "Prossimo",
			"Previous": "Precedente"
		}
	};

	const TTM_LIGHTBOX_ID = 'ttm-lightbox';
	const TTM_LIGHTBOX_CLASS = 'ttm-lightbox';
	const TTM_LIGHTBOX_INNER_CLASS = 'ttm-lightbox-inner';
	const TTM_LIGHTBOX_INNER_SELECTOR = '.' + TTM_LIGHTBOX_INNER_CLASS;

	const TTM_LIGHTBOX_IMAGE_CLASS = 'ttm-lightbox-image';
	const TTM_LIGHTBOX_IMAGE_SELECTOR = '.' + TTM_LIGHTBOX_IMAGE_CLASS
	const TTM_LIGHTBOX_CAPTION_CLASS = 'ttm-lightbox-caption';
	const TTM_LIGHTBOX_CAPTION_SELECTOR = '.' + TTM_LIGHTBOX_CAPTION_CLASS;
	const TTM_LIGHTBOX_ACTIVE_CLASS = 'ttm-lightbox-active';
	const TTM_LIGHTBOX_SHOW_CLASS = 'ttm-lightbox-show';
	const TTM_LIGHTBOX_FADE_CLASS = 'ttm-lightbox-fade';
	const TTM_LIGHTBOX_DISABLED_CLASS = 'ttm-lightbox-disabled';
	const TTM_LIGHTBOX_SCREENREADER_CLASS = 'ttm-lightbox-screen-reader-text';

	const TTM_LIGHTBOX_BUTTON_CLASS = 'ttm-lightbox-button';
	const TTM_LIGHTBOX_NAV_CLASS = 'ttm-lightbox-nav';
	const TTM_LIGHTBOX_CLOSE_CLASS = 'ttm-lightbox-close';
	const TTM_LIGHTBOX_PREV_CLASS = 'ttm-lightbox-prev';
	const TTM_LIGHTBOX_NEXT_CLASS = 'ttm-lightbox-next';
	const TTM_LIGHTBOX_CLOSE_SELECTOR = '.' + TTM_LIGHTBOX_CLOSE_CLASS;
	const TTM_LIGHTBOX_PREV_SELECTOR = '.' + TTM_LIGHTBOX_PREV_CLASS;
	const TTM_LIGHTBOX_NEXT_SELECTOR = '.' + TTM_LIGHTBOX_NEXT_CLASS;

	const TTM_LIGHTBOX_IMAGE_ATTRIBUTE = 'data-lightbox';
	const TTM_LIGHTBOX_IMAGE_ATTRIBUTE_SELECTOR = '[' + TTM_LIGHTBOX_IMAGE_ATTRIBUTE + ']';

	const TTM_LIGHTBOX_TIMEOUT_SHORT = 50;
	const TTM_LIGHTBOX_TIMEOUT_LONG = 300;

	let lastFocus : HTMLElement|null = null;
	let touchstartX : number = 0;
	let touchendX : number = 0;

	const focusElement = ( el : Element ) => (el as HTMLElement).focus();

	const focusSelector = ( selector : string ) => {
		let element = document.querySelector( selector );
		if( null != element ) {
			focusElement( element );
		}
	}

	const keydownEvent = ( event : KeyboardEvent ) => {
		if( ! hasLightbox() ) return;

		switch( event.key ) {
			case 'ArrowLeft' :
				moveLightbox(-1);
				focusSelector( TTM_LIGHTBOX_PREV_SELECTOR );
				break;
			case 'ArrowRight' :
				moveLightbox(1);
				focusSelector( TTM_LIGHTBOX_NEXT_SELECTOR );
				break;
			case 'Escape' :
				closeLightbox();
				break;
		}
	}

	const addImgToLightbox = ( img : HTMLImageElement | null ) => {
		if( img === null ) return;

		let lightbox = getLightbox() as HTMLElement;
		lightbox.querySelectorAll( TTM_LIGHTBOX_IMAGE_SELECTOR ).forEach( ( img ) => {
			img.classList.add( TTM_LIGHTBOX_FADE_CLASS );
			setTimeout( () => {
				img.remove();
			}, TTM_LIGHTBOX_TIMEOUT_LONG );
		});
		lightbox.querySelectorAll( TTM_LIGHTBOX_CAPTION_SELECTOR ).forEach( ( caption ) => {
			caption.classList.add( TTM_LIGHTBOX_FADE_CLASS );
			setTimeout( () => {
				caption.remove();
			}, TTM_LIGHTBOX_TIMEOUT_LONG );
		});

		let inner = getInnerLightbox() as HTMLElement;
		let temp = img.cloneNode() as HTMLImageElement;
		temp.removeAttribute( TTM_LIGHTBOX_IMAGE_ATTRIBUTE );
		let clone = temp.cloneNode() as HTMLImageElement;
		clone.classList.add( TTM_LIGHTBOX_IMAGE_CLASS );
		clone.classList.add( TTM_LIGHTBOX_FADE_CLASS );

		inner.appendChild( clone );

		let alt = img.getAttribute( 'alt' ) as string;
		if( alt.length > 0 ) {
			const caption = createElement( 'div', { 'class' : TTM_LIGHTBOX_CAPTION_CLASS } );
			var p = createElement( 'p', {} );
			var altNode = document.createTextNode( alt );
			p.appendChild( altNode );
			caption.appendChild( p );
			inner.appendChild( caption );
		}

		setTimeout( () => { clone.classList.remove( TTM_LIGHTBOX_FADE_CLASS ) }, TTM_LIGHTBOX_TIMEOUT_SHORT );

		let prev = document.querySelector( TTM_LIGHTBOX_PREV_SELECTOR ) as HTMLButtonElement;
		if( isFirstImageInLightbox( img.src ) ) {
			disableElement( prev );
		}
		else {
			enableElement( prev );
		}

		let next = document.querySelector( TTM_LIGHTBOX_NEXT_SELECTOR ) as HTMLButtonElement;
		if( isLastImageInLightbox( img.src ) ) {
			disableElement( next );
			focusSelector( TTM_LIGHTBOX_CLOSE_SELECTOR );
		}
		else {
			enableElement( next );
		}
	}

	const enableElement = ( el : HTMLButtonElement ) => {
		el.classList.remove( TTM_LIGHTBOX_DISABLED_CLASS );
		el.disabled = false;
	}

	const disableElement = ( el : HTMLButtonElement ) => {
		el.classList.add( TTM_LIGHTBOX_DISABLED_CLASS );
		el.disabled = true;
	}

	const isFirstImageInLightbox = ( src : string ) => {
		let subset = getCurrentLightboxSubset();
		return src === subset[0]?.getAttribute( 'src' );
	}

	const isLastImageInLightbox = ( src : string ) => {
		let subset = getCurrentLightboxSubset();
		return src === subset[ subset.length - 1 ]?.getAttribute( 'src' );
	}

	const getCurrentLightboxImage = () => {
		let lightbox = getLightbox() as HTMLElement;
		return lightbox.querySelector( 'img' );
	}

	const getCurrentLightboxSubset = () => {
		let current = getCurrentLightboxImage() as HTMLImageElement;
		let images = document.querySelectorAll( TTM_LIGHTBOX_IMAGE_ATTRIBUTE_SELECTOR );
		
		let attribute = '';

		for( let i = 0; i < images.length; i++ ) {
			if( images[i]?.getAttribute( 'src' ) === current.getAttribute( 'src' ) ) {
				attribute = images[i]?.getAttribute( TTM_LIGHTBOX_IMAGE_ATTRIBUTE ) as string;
			}
		}
		
		let subset = document.querySelectorAll( '[' + TTM_LIGHTBOX_IMAGE_ATTRIBUTE + '="' + attribute + '"]' ) as NodeListOf<HTMLImageElement>;
		return subset;
	}

	const moveLightbox = ( amt : number ) => {
		let current = getCurrentLightboxImage() as HTMLImageElement;
		let subset = getCurrentLightboxSubset();
		
		for( let i = 0; i < subset.length; i++ ) {
			if( 
				current.getAttribute( 'src' ) === subset[i]?.getAttribute( 'src' ) &&
				i + amt < subset.length &&
				i + amt >= 0
			) {
				let img = subset[ i + amt ] ?? null;
				addImgToLightbox( img );
				return;
			}
		}
	}

	const boxClickEvent = ( img : HTMLImageElement ) => {
		showLightbox();
		addImgToLightbox( img );
	}

	const showLightbox = () => {
		document.body.classList.add( TTM_LIGHTBOX_ACTIVE_CLASS );
		createLightbox();

		let lightbox = getLightbox() as HTMLElement;
		let inner = getInnerLightbox() as HTMLElement;

		setTimeout( () => { lightbox.classList.add( TTM_LIGHTBOX_SHOW_CLASS ) }, TTM_LIGHTBOX_TIMEOUT_SHORT );
		setTimeout( () => { inner.classList.add( TTM_LIGHTBOX_SHOW_CLASS ) }, TTM_LIGHTBOX_TIMEOUT_LONG );

		lightbox.addEventListener( 'click', (e) => {
			if( e.target !== e.currentTarget ) return;
			closeLightbox();
		});
	}

	const closeLightbox = () => {
		let lightbox = getLightbox() as HTMLElement;
		let inner = getInnerLightbox() as HTMLElement;

		inner.classList.remove( TTM_LIGHTBOX_SHOW_CLASS );

		setTimeout( () => {
			lightbox.classList.remove( TTM_LIGHTBOX_SHOW_CLASS );

			setTimeout( () => {
				lightbox.remove();
				document.body.classList.remove( TTM_LIGHTBOX_ACTIVE_CLASS );
			}, TTM_LIGHTBOX_TIMEOUT_SHORT );
		}, TTM_LIGHTBOX_TIMEOUT_LONG );

		if( lastFocus !== null ) {
			focusElement( lastFocus );
		}
	}

	const getLightbox = () => document.getElementById( TTM_LIGHTBOX_ID );

	const hasLightbox = () => getLightbox() !== null;

	const getInnerLightbox = () => {
		let lightbox = getLightbox() as HTMLElement;
		return lightbox.querySelector( TTM_LIGHTBOX_INNER_SELECTOR );
	}

	const createElement = ( name : string, atts : object) => {
		const el = document.createElement( name ) as HTMLElement;
		for( let [ key, value ] of Object.entries( atts ) ) {
			if( Array.isArray( value ) ) {
				value = value.join( ' ' );
			}
			el.setAttribute( key, value );
		}
		return el;
	}

	const createLightbox = () => {
		if( hasLightbox() ) return;

		const lightbox = createElement( 'div', { 'id' : TTM_LIGHTBOX_ID, 'class' : TTM_LIGHTBOX_CLASS } );

		const inner = document.createElement( 'div' );
		inner.setAttribute( 'class', TTM_LIGHTBOX_INNER_CLASS );
		lightbox.appendChild( inner );

		const close = createElement( 'button', { 'class' : [ TTM_LIGHTBOX_CLOSE_CLASS, TTM_LIGHTBOX_BUTTON_CLASS ] } );
		let closeSpan = createElement( 'span', { 'class' : TTM_LIGHTBOX_SCREENREADER_CLASS } );
		let closeText = document.createTextNode( __( 'Close' ) );
		closeSpan.appendChild( closeText );
		close.appendChild( closeSpan );		
		close.addEventListener( 'click', closeLightbox );
		inner.appendChild( close );

		const prev = createElement( 'button', { 'class' : [ TTM_LIGHTBOX_PREV_CLASS, TTM_LIGHTBOX_NAV_CLASS, TTM_LIGHTBOX_BUTTON_CLASS  ] } );
		let prevSpan = createElement( 'span', { 'class' : TTM_LIGHTBOX_SCREENREADER_CLASS } );
		let prevText = document.createTextNode( __( 'Previous' ) );
		prevSpan.appendChild( prevText );
		prev.appendChild( prevSpan );
		prev.addEventListener( 'click', () => moveLightbox(-1) );
		inner.appendChild( prev );

		const next = createElement( 'button', { 'class' : [ TTM_LIGHTBOX_NEXT_CLASS, TTM_LIGHTBOX_NAV_CLASS, TTM_LIGHTBOX_BUTTON_CLASS ] } );
		let nextSpan = createElement( 'span', { 'class' : TTM_LIGHTBOX_SCREENREADER_CLASS } );
		let nextText = document.createTextNode( __( 'Next' ) );
		nextSpan.appendChild( nextText );
		next.appendChild( nextSpan );
		next.addEventListener( 'click', () => moveLightbox(1) );
		inner.appendChild( next );

		document.body.appendChild( lightbox );
		focusSelector( TTM_LIGHTBOX_NEXT_SELECTOR );
	}

	const __ = ( valueToTranslate : string ) => {
		let lang = navigator.language;

		if( null == i18n[ lang as keyof object ] ) {
			lang = lang.slice( 0, lang.indexOf( '-' ) );
		}

		if( null == i18n[ lang as keyof object ] ) {
			return valueToTranslate;
		}

		if( null == i18n[ lang as keyof object ][ valueToTranslate ] ) {
			return valueToTranslate;
		}

		return i18n[ lang as keyof object ][ valueToTranslate ];
	}
		
	function checkDirection() {
		if( touchendX < touchstartX ) {
			moveLightbox(1);
		}
		if( touchendX > touchstartX ) {
			moveLightbox(-1);
		}
	}

	document.addEventListener( 'touchstart', e => {
		let screenX = e.changedTouches[0]?.screenX;
		if( typeof screenX !== 'undefined' ) {
			touchstartX = screenX;
		}
	});

	document.addEventListener( 'touchend', e => {
		let screenX = e.changedTouches[0]?.screenX;
		if( typeof screenX !== 'undefined' ) {
			touchendX = screenX;
		}
		if( hasLightbox() ) {
			checkDirection();
		}
	});

	addEventListener( 'keydown', keydownEvent );

	document.querySelectorAll( TTM_LIGHTBOX_IMAGE_ATTRIBUTE_SELECTOR ).forEach( ( box ) => {

		box.setAttribute( 'tabindex', '0' );
		box.setAttribute( 'role', 'button' );

		box.addEventListener( 'click', () => { boxClickEvent( box as HTMLImageElement ) } );
		box.addEventListener( 'keydown', ( event : Event ) => {
			lastFocus = event.target as HTMLElement;

			let e = event as KeyboardEvent;
			if( e.code === 'Space' || e.code === 'Enter' ) {
				( box as HTMLElement ).click();
			}
			if( hasLightbox() ) {
				focusSelector( TTM_LIGHTBOX_NEXT_SELECTOR );
			}
		})
	});
})();