import DashboardLayout from '@/components/layout/DashboardLayout';
import SalaryStructureManagement from '@/components/settings/SalaryStructureManagement';

const SalaryStructures = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Salary Structures</h1>
          <p className="text-muted-foreground">
            Manage salary templates for staff members
          </p>
        </div>
        <SalaryStructureManagement />
      </div>
    </DashboardLayout>
  );
};

export default SalaryStructures;
