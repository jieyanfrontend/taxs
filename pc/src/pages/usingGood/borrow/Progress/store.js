import {observable} from 'mobx';

class Store {
  @observable params={
    visible:false,
    loading:false
  }
  @observable dataSource = [];
  @observable data = {};
  @observable info = {
    preprocess: {},
    log: [],
    proDataSource: []
  };
}

export default new Store();