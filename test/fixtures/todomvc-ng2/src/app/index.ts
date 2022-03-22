export * from './app.module';

interface Aa {}

// The prefix of class name matches the interface name
class AaBb {}
//    ^^

// The intermediate of class name matches the interface name
class BbAaCc {}
//      ^^

// The suffix of class name matches the interface name
class CcAa {}
//      ^^

class Container {
    // This type links to Aa interface, not AaBb class.
    a: AaBb;

    // This type links to Aa interface, not BbAaCc class.
    b: BbAaCc;

    // This type links to Aa interface, not CcAa class.
    c: CcAa;
}
