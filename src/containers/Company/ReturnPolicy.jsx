import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useOutletContext } from 'react-router';
import { ReturnPolicyComponent } from '../ReturnPolicy';
import { updateReturnPolicyAsync } from '../../redux/companySlice';

const CompanyReturnPolicy = () => {
  const dispatch = useDispatch();
  const [company] = useOutletContext();

  const handleEdit = useCallback((key, value, callback) => {
    dispatch(updateReturnPolicyAsync(key, value, callback));
  }, []);

  return (
    <div className="table-wrap">
      {company.returnPolicy ? (
        <ReturnPolicyComponent
          effectiveDate={new Date(company.returnPolicy.updatedAt).toLocaleDateString()}
          onEdit={handleEdit}
          minNoticeTime={company.returnPolicy.minNoticeTime}
          refundPercent={company.returnPolicy.refundPercent}
          refundDelay={company.returnPolicy.refundDelay}
          email={company.email}
          phoneNumber={company.phoneNumber}
        />
      ) : (
        <ReturnPolicyComponent
          onEdit={handleEdit}
          email={company.email}
          phoneNumber={company.phoneNumber}
        />
      )}
    </div>
  );
};

export default CompanyReturnPolicy;
