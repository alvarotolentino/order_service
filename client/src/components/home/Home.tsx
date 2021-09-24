import React, { Component } from 'react';
import { Chart } from '../chart/Chart';
import './home.css';

const getOrderByProduct = async (productId: string) => {
  return Promise.all([
    fetch(
      `http://${process.env.REACT_APP_API_HOST || 'localhost'}:${
        process.env.REACT_APP_API_PORT || '4000'
      }/api/v1/purchase_orders/product/${productId}`
    ),
    fetch(
      `http://${process.env.REACT_APP_API_HOST || 'localhost'}:${
        process.env.REACT_APP_API_PORT || '4000'
      }/api/v1/sales_orders/product/${productId}`
    ),
  ])
    .then((responses) => {
      return Promise.all(
        responses.map(function (response) {
          return response.json();
        })
      );
    })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      console.error('Error fetching orders');
      console.error(JSON.stringify(err));
      return [];
    });
};

export default class Home extends Component<{}, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      products: [],
      productSelected: '',
      purchaseOrdersByProduct: [],
      salesOrdersByProduct: [],
    };
  }

  handleChange = async (event: any) => {
    this.setState({ productSelected: event.target.value });
    if (event.target.value) {
      const data = await getOrderByProduct(event.target.value);
      console.log(data);
      this.setState({ purchaseOrdersByProduct: data[0] });
      this.setState({ salesOrdersByProduct: data[1] });
    } else {
      this.setState({ purchaseOrdersByProduct: [] });
      this.setState({ salesOrdersByProduct: [] });
    }
  };

  componentDidMount() {
    fetch(
      `http://${process.env.REACT_APP_API_HOST || 'localhost'}:${
        process.env.REACT_APP_API_PORT || '4000'
      }/api/v1/products`
    )
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        this.setState({
          products: data,
        });
      })
      .catch((err) => {
        console.log('could not fetch products');
        console.log(JSON.stringify(err));
      });
  }

  render() {
    return (
      <div className='home'>
        <div className='productSelector'>
          <div className='selectorItem'>
            {this.state.products.length > 0 ? (
              <>
                <span>Select a product</span>
                <select
                  name='products'
                  value={this.state.productSelected}
                  onChange={this.handleChange}
                  className='productSelect'
                >
                  <option value=''></option>
                  {this.state.products.map((item: any) => (
                    <option key={item.product_id} value={item.product_id}>
                      {item.product_name}
                    </option>
                  ))}
                </select>
              </>
            ) : null}
          </div>
        </div>
        <div className='orderCharts'>
          <div className='chartItem'>
            {this.state.purchaseOrdersByProduct.length > 0 ? (
              <Chart
                data={this.state.purchaseOrdersByProduct}
                title='Purchase Orders History'
                grid
                dataKey='quantity'
              ></Chart>
            ) : (
              <Chart
                data={[]}
                title='Purchase Orders History'
                grid
                dataKey='quantity'
              ></Chart>
            )}
          </div>
          <div className='chartItem'>
            {this.state.salesOrdersByProduct.length > 0 ? (
              <Chart
                data={this.state.salesOrdersByProduct}
                title='Sales Orders History'
                grid
                dataKey='quantity'
              ></Chart>
            ) : (
              <Chart
                data={[]}
                title='Sales Orders History'
                grid
                dataKey='quantity'
              ></Chart>
            )}
          </div>
        </div>
      </div>
    );
  }
}
