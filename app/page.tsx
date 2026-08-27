import SurveyFlow from './components/SurveyFlow';
import { TopBrandBar } from './components/ui';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <TopBrandBar />
      <div className="py-8 px-4">
      <div className="mx-auto max-w-xl">
        <div className="bg-white border rounded-sm p-6 sm:p-10" style={{ borderColor: '#DDE1E7' }}>
          <SurveyFlow />
        </div>
      </div>
      </div>
    </main>
  );
}
