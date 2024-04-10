import EmptyListPanel from '../../../components/EmptyListPanel';
import { Heading1 } from '../../Aside';

const Downloads = () => (
  <div className="h-full overflow-auto">
    <section className="flex flex-col gap-10">
      <Heading1>Downloads</Heading1>
      <div className="flex justify-center w-full">
        <EmptyListPanel text="Coming Soon" />
      </div>
    </section>
  </div>
);

export default Downloads;
