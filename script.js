/*
 _     _ _        _                                _       _       _
(_) __| | | __   (_) __ ___   ____ _ ___  ___ _ __(_)_ __ | |_    (_)
| |/ _` | |/ /   | |/ _` \ \ / / _` / __|/ __| '__| | '_ \| __|   | |
| | (_| |   <    | | (_| |\ V / (_| \__ \ (__| |  | | |_) | |_ _  | |
|_|\__,_|_|\_\  _/ |\__,_| \_/ \__,_|___/\___|_|  |_| .__/ \__( ) |_|
               |__/                                 |_|       |/
                    _                 _     _     __  __    __
 _   _ ___  ___  __| |   __ _ _ __   | |   | |   |  \/  |  / _| ___  _ __
| | | / __|/ _ \/ _` |  / _` | '_ \  | |   | |   | |\/| | | |_ / _ \| '__|
| |_| \__ \  __/ (_| | | (_| | | | | | |___| |___| |  | | |  _| (_) | |
 \__,_|___/\___|\__,_|  \__,_|_| |_| |_____|_____|_|  |_| |_|  \___/|_|

 _   _     _                        _   _            _
| |_| |__ (_)___   _ __   __ _ _ __| |_(_) ___ _   _| | __ _ _ __
| __| '_ \| / __| | '_ \ / _` | '__| __| |/ __| | | | |/ _` | '__|
| |_| | | | \__ \ | |_) | (_| | |  | |_| | (__| |_| | | (_| | |
 \__|_| |_|_|___/ | .__/ \__,_|_|   \__|_|\___|\__,_|_|\__,_|_|
                  |_|
  __ _ _
 / _(_) | ___
| |_| | |/ _ \
|  _| | |  __/
|_| |_|_|\___|
*/
(() => {
    'use strict';

    const MAX_CONCURRENT_SOUNDS = 8;
    const TOOLTIP_OFFSET = 8;
    const VIEWPORT_PADDING = 8;
    const FINE_POINTER_QUERY = '(hover: hover) and (pointer: fine)';

    const runWhenReady = (callback) => {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback, { once: true });
            return;
        }

        callback();
    };

    const setupSwagcatAudio = () => {
        const sourceAudio = document.getElementById('iloveswagcat');
        const triggers = document.querySelectorAll('.swagcat-image');

        if (!(sourceAudio instanceof HTMLAudioElement) || triggers.length === 0) {
            return;
        }

        const hasSource = sourceAudio.currentSrc
            || sourceAudio.getAttribute('src')
            || sourceAudio.querySelector('source[src]');

        if (!hasSource) {
            return;
        }

        const activeSounds = new Set();
        sourceAudio.preload = 'auto';

        const stopSound = (sound) => {
            if (!activeSounds.delete(sound)) {
                return;
            }

            sound.pause();
            sound.removeAttribute('src');
            sound.querySelectorAll('source').forEach((source) => {
                source.removeAttribute('src');
            });
            sound.load();
        };

        const playSound = () => {
            if (activeSounds.size >= MAX_CONCURRENT_SOUNDS) {
                stopSound(activeSounds.values().next().value);
            }

            const sound = sourceAudio.cloneNode(true);
            let errorReported = false;

            sound.removeAttribute('id');
            sound.preload = 'auto';
            activeSounds.add(sound);

            const reportError = (error) => {
                if (errorReported || error?.name === 'AbortError') {
                    return;
                }

                errorReported = true;
                console.warn('Unable to play the Swagcat sound.', error);
            };

            sound.addEventListener('ended', () => {
                activeSounds.delete(sound);
            }, { once: true });

            sound.addEventListener('error', () => {
                activeSounds.delete(sound);
                reportError(sound.error);
            }, { once: true });

            try {
                const playback = sound.play();

                playback?.catch((error) => {
                    const wasActive = activeSounds.delete(sound);

                    if (wasActive) {
                        reportError(error);
                    }
                });
            } catch (error) {
                activeSounds.delete(sound);
                reportError(error);
            }
        };

        triggers.forEach((trigger) => {
            const isNativelyInteractive = trigger.matches(
                'a[href], button, input:not([type="hidden"]), select, textarea, summary'
            );

            if (!trigger.hasAttribute('aria-label')
                && !trigger.hasAttribute('aria-labelledby')) {
                trigger.setAttribute('aria-label', 'Play the Swagcat sound');
            }

            if (!isNativelyInteractive) {
                if (!trigger.hasAttribute('role')) {
                    trigger.setAttribute('role', 'button');
                }
                if (!trigger.hasAttribute('tabindex')) {
                    trigger.tabIndex = 0;
                }

                trigger.addEventListener('keydown', (event) => {
                    const isActivationKey = event.key === 'Enter' || event.key === ' ';

                    if (!isActivationKey || event.repeat || event.target !== trigger) {
                        return;
                    }

                    event.preventDefault();
                    playSound();
                });
            }

            trigger.addEventListener('click', playSound);
        });

        window.addEventListener('pagehide', () => {
            [...activeSounds].forEach(stopSound);
        });
    };

    const setupReasoningTooltip = () => {
        const watermark = document.querySelector('.watermark');
        const tooltip = document.querySelector('.reasoning');

        if (!watermark || !tooltip) {
            return;
        }

        const descriptionTarget = watermark.querySelector('a, button') || watermark;
        const tooltipImage = tooltip.querySelector('img');
        const hoverMedia = window.matchMedia(FINE_POINTER_QUERY);
        const configuredImageMaxWidth = tooltipImage
            ? window.getComputedStyle(tooltipImage).maxWidth
            : '';
        const imageMaxWidth = configuredImageMaxWidth.endsWith('px')
            ? Number.parseFloat(configuredImageMaxWidth)
            : Number.POSITIVE_INFINITY;

        if (!tooltip.id) {
            let tooltipId = 'watermark-reasoning';
            let suffix = 2;

            while (document.getElementById(tooltipId)) {
                tooltipId = `watermark-reasoning-${suffix}`;
                suffix += 1;
            }

            tooltip.id = tooltipId;
        }

        if (!tooltip.hasAttribute('role')) {
            tooltip.setAttribute('role', 'tooltip');
        }

        const descriptionIds = new Set(
            (descriptionTarget.getAttribute('aria-describedby') || '')
                .split(/\s+/)
                .filter(Boolean)
        );
        descriptionIds.add(tooltip.id);
        descriptionTarget.setAttribute('aria-describedby', [...descriptionIds].join(' '));

        let animationFrame = 0;
        let hasFocus = false;
        let isHovering = false;
        let pointerPosition = null;

        const getViewport = () => {
            const visualViewport = window.visualViewport;

            return {
                height: visualViewport?.height || window.innerHeight,
                left: visualViewport?.offsetLeft || 0,
                top: visualViewport?.offsetTop || 0,
                width: visualViewport?.width || window.innerWidth
            };
        };

        const clamp = (value, minimum, maximum) => (
            Math.min(Math.max(value, minimum), Math.max(minimum, maximum))
        );

        const constrainImage = () => {
            if (!tooltipImage) {
                return;
            }

            const viewport = getViewport();
            const availableWidth = Math.max(1, viewport.width - (VIEWPORT_PADDING * 2));
            const availableHeight = Math.max(1, viewport.height - (VIEWPORT_PADDING * 2));

            tooltipImage.style.maxWidth = `${Math.min(imageMaxWidth, availableWidth)}px`;
            tooltipImage.style.maxHeight = `${availableHeight}px`;
            tooltipImage.style.objectFit = 'contain';
        };

        const setPosition = (left, top, tooltipBounds) => {
            const viewport = getViewport();
            const minimumLeft = viewport.left + VIEWPORT_PADDING;
            const minimumTop = viewport.top + VIEWPORT_PADDING;
            const maximumLeft = viewport.left + viewport.width
                - tooltipBounds.width - VIEWPORT_PADDING;
            const maximumTop = viewport.top + viewport.height
                - tooltipBounds.height - VIEWPORT_PADDING;

            tooltip.style.left = `${Math.round(clamp(left, minimumLeft, maximumLeft))}px`;
            tooltip.style.top = `${Math.round(clamp(top, minimumTop, maximumTop))}px`;
        };

        const positionTooltip = () => {
            const tooltipBounds = tooltip.getBoundingClientRect();

            if (isHovering && pointerPosition) {
                const viewport = getViewport();
                let left = pointerPosition.x + TOOLTIP_OFFSET;
                let top = pointerPosition.y + TOOLTIP_OFFSET;

                if (left + tooltipBounds.width + VIEWPORT_PADDING
                    > viewport.left + viewport.width) {
                    left = pointerPosition.x - tooltipBounds.width - TOOLTIP_OFFSET;
                }
                if (top + tooltipBounds.height + VIEWPORT_PADDING
                    > viewport.top + viewport.height) {
                    top = pointerPosition.y - tooltipBounds.height - TOOLTIP_OFFSET;
                }

                setPosition(left, top, tooltipBounds);
                return;
            }

            const watermarkBounds = watermark.getBoundingClientRect();
            const centeredLeft = watermarkBounds.left
                + ((watermarkBounds.width - tooltipBounds.width) / 2);
            let top = watermarkBounds.top - tooltipBounds.height - TOOLTIP_OFFSET;

            if (top < getViewport().top + VIEWPORT_PADDING) {
                top = watermarkBounds.bottom + TOOLTIP_OFFSET;
            }

            setPosition(centeredLeft, top, tooltipBounds);
        };

        const schedulePosition = () => {
            if (animationFrame || (!hasFocus && !isHovering)) {
                return;
            }

            animationFrame = window.requestAnimationFrame(() => {
                animationFrame = 0;
                positionTooltip();
            });
        };

        const updateVisibility = () => {
            if (hasFocus || isHovering) {
                tooltip.style.display = 'block';
                constrainImage();
                schedulePosition();
                return;
            }

            tooltip.style.removeProperty('display');

            if (animationFrame) {
                window.cancelAnimationFrame(animationFrame);
                animationFrame = 0;
            }
        };

        watermark.addEventListener('pointerenter', (event) => {
            if (!hoverMedia.matches) {
                return;
            }

            isHovering = true;
            pointerPosition = { x: event.clientX, y: event.clientY };
            updateVisibility();
        });

        watermark.addEventListener('pointermove', (event) => {
            if (!isHovering) {
                return;
            }

            pointerPosition = { x: event.clientX, y: event.clientY };
            schedulePosition();
        }, { passive: true });

        watermark.addEventListener('pointerleave', () => {
            isHovering = false;
            pointerPosition = null;
            updateVisibility();
        });

        watermark.addEventListener('focusin', () => {
            hasFocus = true;
            updateVisibility();
        });

        watermark.addEventListener('focusout', (event) => {
            if (event.relatedTarget && watermark.contains(event.relatedTarget)) {
                return;
            }

            hasFocus = false;
            updateVisibility();
        });

        const handleViewportChange = () => {
            constrainImage();
            schedulePosition();
        };

        window.addEventListener('resize', handleViewportChange, { passive: true });
        window.visualViewport?.addEventListener(
            'resize',
            handleViewportChange,
            { passive: true }
        );
        tooltipImage?.addEventListener('load', schedulePosition);
        hoverMedia.addEventListener('change', (event) => {
            if (event.matches) {
                return;
            }

            isHovering = false;
            pointerPosition = null;
            updateVisibility();
        });
    };

    runWhenReady(() => {
        setupSwagcatAudio();
        setupReasoningTooltip();
    });
})();
