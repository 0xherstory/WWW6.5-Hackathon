import { useState } from 'react';
import { Contract, parseEther } from 'ethers';
import { MAIN_ABI, CONTRACT_ADDRESSES } from '../utils/contracts';

/**
 * PoolCreator 组件
 * 表单用于创建新的理财学习池，包含字段验证和交易处理
 */
export default function PoolCreator({ signer, onPoolCreated }) {
  const [form, setForm] = useState({
    name: '',
    strategy: '',
    maxMembers: '',
    minDeposit: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txError, setTxError] = useState(null);
  const [txSuccess, setTxSuccess] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = '请输入池名称';
    if (!form.strategy.trim()) newErrors.strategy = '请输入投资策略';
    if (!form.maxMembers || Number(form.maxMembers) < 2)
      newErrors.maxMembers = '最大成员数至少为 2';
    if (!form.minDeposit || Number(form.minDeposit) <= 0)
      newErrors.minDeposit = '最小存款金额必须大于 0';
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // 清除对应字段的错误
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTxError(null);
    setTxSuccess(false);

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (!signer || !CONTRACT_ADDRESSES.MAIN) {
      setTxError('合约未连接，请先连接钱包');
      return;
    }

    setIsSubmitting(true);
    try {
      const contract = new Contract(CONTRACT_ADDRESSES.MAIN, MAIN_ABI, signer);
      const tx = await contract.createPool(
        form.name.trim(),
        form.strategy.trim(),
        Number(form.maxMembers),
        parseEther(form.minDeposit)
      );
      await tx.wait();
      setTxSuccess(true);
      setForm({ name: '', strategy: '', maxMembers: '', minDeposit: '' });
      if (onPoolCreated) onPoolCreated();
    } catch (err) {
      if (err.code === 4001) {
        setTxError('您取消了交易');
      } else {
        setTxError('创建失败：' + (err.reason || err.message || '未知错误'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pool-creator">
      <h3 className="section-title">创建理财学习池</h3>
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="pool-name">池名称 *</label>
          <input
            id="pool-name"
            name="name"
            type="text"
            placeholder="例如：稳健成长池"
            value={form.name}
            onChange={handleChange}
            className={errors.name ? 'input-error' : ''}
          />
          {errors.name && <span className="field-error">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="pool-strategy">投资策略 *</label>
          <input
            id="pool-strategy"
            name="strategy"
            type="text"
            placeholder="例如：低风险稳健型"
            value={form.strategy}
            onChange={handleChange}
            className={errors.strategy ? 'input-error' : ''}
          />
          {errors.strategy && <span className="field-error">{errors.strategy}</span>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="pool-maxMembers">最大成员数 *</label>
            <input
              id="pool-maxMembers"
              name="maxMembers"
              type="number"
              min="2"
              placeholder="例如：10"
              value={form.maxMembers}
              onChange={handleChange}
              className={errors.maxMembers ? 'input-error' : ''}
            />
            {errors.maxMembers && <span className="field-error">{errors.maxMembers}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="pool-minDeposit">最小存款 (HRT) *</label>
            <input
              id="pool-minDeposit"
              name="minDeposit"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="例如：100"
              value={form.minDeposit}
              onChange={handleChange}
              className={errors.minDeposit ? 'input-error' : ''}
            />
            {errors.minDeposit && <span className="field-error">{errors.minDeposit}</span>}
          </div>
        </div>

        {txError && <p className="tx-error">{txError}</p>}
        {txSuccess && <p className="tx-success">✓ 池创建成功！</p>}

        <button
          type="submit"
          className="btn btn-create-pool"
          disabled={isSubmitting}
        >
          {isSubmitting ? <><span className="spinner" />创建中...</> : '创建池'}
        </button>
      </form>
    </div>
  );
}
