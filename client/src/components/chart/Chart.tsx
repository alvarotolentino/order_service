import './chart.css';
import {
  LineChart,
  Line,
  XAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const Chart = ({ title, data, dataKey, grid }: any) => {
  return (
    <div className='chart'>
      <h3 className='chartTitle'>{title}</h3>
      <ResponsiveContainer width='100%' aspect={4 / 1}>
        <LineChart data={data}>
          <XAxis dataKey='issue_date' stroke='#5550bd'></XAxis>
          <Line type='monotone' dataKey={dataKey} stroke='#5550bd'></Line>
          <Tooltip></Tooltip>
          {grid && (
            <CartesianGrid
              stroke='#e0dfdf'
              strokeDasharray='5 5'
            ></CartesianGrid>
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
