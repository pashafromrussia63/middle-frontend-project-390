import 'React'
import { useParams } from 'react-router-dom';

export default function BookingPage() {
  const { id } = useParams();

  return (
    <div>
      <h1>Booking</h1>
      <p>Flight ID: {id}</p>
    </div>
  );
}