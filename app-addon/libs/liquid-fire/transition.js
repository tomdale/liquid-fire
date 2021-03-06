import Promise from "./promise";

function Transition(parentView, oldView, newContent, animation, animationArgs, transitionMap) {
  this.parentView = parentView;
  this.oldView = oldView;
  this.newContent = newContent;
  this.animation = animation;
  this.animationArgs = animationArgs;
  this.transitionMap = transitionMap;
}

Transition.prototype = {
  run: function() {
    if (!this.animation) {
      if (this.oldView) {
        this.oldView.destroy();
      }
      return this.parentView._pushNewView(this.newContent).then(function(newView){
        var elt;
        if (newView && (elt = newView.$())) {
          elt.show();
        }
      });
    }

    var self = this;
    function insertNewView() {
      if (self.inserted) {
        return self.inserted;
      }
      return self.inserted = self.parentView._pushNewView(self.newContent);
    }
    return this.animation.apply(this, [this.oldView, insertNewView].concat(this.animationArgs)).then(function(){
      self.maybeDestroyOldView();
    });
  },

  maybeDestroyOldView: function(){
    if (!this.interrupted && this.oldView) {
      this.oldView.destroy();
    }
  },

  interrupt: function(){
    // If we haven't yet inserted the new view, don't. And tell the
    // old view not to destroy when our animation stops, because the
    // next transition is going to take over and keep using it.
    if (!this.inserted) {
      this.inserted = Promise.cast(null);
      this.interrupted = true;
    }
  },

  // Lets you compose your transitions out of other named transitions.
  lookup: function(transitionName) {
    return this.transitionMap.lookup(transitionName);
  }
};

export default Transition;
