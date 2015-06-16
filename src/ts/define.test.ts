
declare var __html__;

describe('ENV', () => {
  it('window', done => {
    window.should.equal(window.window);
    done();
  });

  it('width', done => {
    window.innerWidth.should.greaterThan(500);
    done();
  });

  it('height', done => {
    window.innerHeight.should.greaterThan(500);
    done();
  });

  it('fixture', done => {
    document.body.innerHTML = __html__['test/fixture/index.html'];
    done();
  });
});
