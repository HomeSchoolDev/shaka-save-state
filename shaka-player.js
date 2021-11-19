import shaka from 'shaka-player/dist/shaka-player.ui';
// import dynamic from 'next/dynamic';
// const shaka = dynamic(() => import('shaka-player/dist/shaka-player.ui'), { ssr: false });
import React, { useEffect, useState } from 'react';

/**
 * A React component for shaka-player.
 * @param {string} src
 * @param {shaka.extern.PlayerConfiguration} config
 * @param {boolean} autoPlay
 * @param {number} width
 * @param {number} height
 * @param ref
 * @returns {*}
 * @constructor
 */
function ShakaPlayer({ src, config, chromeless, className, ...rest }, ref) {
  const uiContainerRef = React.useRef(null);
  const videoRef = React.useRef(null);

  const [player, setPlayer] = React.useState(null);
  const [ui, setUi] = React.useState(null);

  // Effect to handle component mount & mount.
  // Not related to the src prop, this hook creates a shaka.Player instance.
  // This should always be the first effect to run.
  React.useEffect(() => {
    const player = new shaka.Player(videoRef.current);
    setPlayer(player);

    let ui;
    if (!chromeless) {
      const ui = new shaka.ui.Overlay(
        player,
        uiContainerRef.current,
        videoRef.current
      );
      setUi(ui);
    }

    return () => {
      player.destroy();
      if (ui) {
        ui.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (player) {
        const eventManager = new shaka.util.EventManager();
        eventManager.listen(videoRef.current, `timeupdate`, (event) => {
            if (player?.getMediaElement()) {
                localStorage.setItem('last_load_time', player.getMediaElement().currentTime);
            }
        });
    }
  }, [player]);

  // Keep shaka.Player.configure in sync.
  React.useEffect(() => {
    if (player && config) {
      player.configure(config);
    }
  }, [player, config]);

  // Load the source url when we have one.
  React.useEffect(() => {
    if (player && src) {
        const lastLoadTime = localStorage.getItem('last_load_time');
        const loadTime = lastLoadTime ? Number(lastLoadTime) : 0;
        player.load(src, loadTime);
    }
  }, [player, src]);

  // Define a handle for easily referencing Shaka's player & ui API's.
  React.useImperativeHandle(
    ref,
    () => ({
      get player() {
        return player;
      },
      get ui() {
        return ui;
      },
      get videoElement() {
        return videoRef.current;
      }
    }),
    [player, ui]
  );

  return (
    <div ref={uiContainerRef} className={className}>
      <video
        ref={videoRef}
        style={{
          maxWidth: '100%',
          width: '100%'
        }}
        {...rest}
      />
    </div>
  );
}

export default React.forwardRef(ShakaPlayer);