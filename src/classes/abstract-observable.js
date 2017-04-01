/**
 * An abstract class for implementing the Observer pattern
 */
class AbstractObservable
{
  /**
   * Constructor
   */
  constructor()
  {
    this.observers = [];
  }

  ////////////////////////////////////////////////////////////
  // INSTANCE METHODS
  ////////////////////////////////////////////////////////////

  /**
   * Adds an observer for a specific event
   * @param {String}    eventName   - the name of the event
   * @param {Function}  callback    - the callback function
   */
  addObserver(eventName, callback)
  {
    this.observers.push({eventName, callback});
  }

  /**
   * Notifies the observers of a specific event
   * @param {String}  eventName - the name of the event
   * @param {*}       args      - arguments passed to the callback function registered with the addObserver method
   */
  notifyObservers(eventName, ...args)
  {
    this.observers
      .filter((o) => (o.eventName === eventName))
      .forEach((o) => o.callback.apply(this, args));
  }

  /**
   * Removes a specific observer based on the name of the event and the callback function
   * @param {String}    eventName   - the name of the event
   * @param {Function}  callback    - the callback function
   */
  removeObserver(eventName, callback)
  {
    this.observers = this.observers.filter((o) => (o.eventName !== eventName || o.callback !== callback));
  }

  /**
   * Removes multiple observers based on the name of the event
   * @param {String} eventName - the name of the event
   */
  removeObservers(eventName)
  {
    this.observers = this.observers.filter((o) => (o.eventName !== eventName));
  }

  /**
   * Removes all observers
   */
  removeObserversAll()
  {
    this.observers = [];
  }
}

module.exports = AbstractObservable;
