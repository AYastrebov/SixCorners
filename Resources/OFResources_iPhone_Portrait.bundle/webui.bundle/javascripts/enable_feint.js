// Open the dashboard (or prompt login) when the leaf bar button is tapped.
OF.barButtonTouch = function() {
  OF.trackEvent('game_channel', 'denied_of');
  OF.sendAction('deniedOpenFeint');
};