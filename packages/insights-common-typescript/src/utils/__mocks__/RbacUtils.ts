const rbac: any = jest.createMockFromModule('../RbacUtils');

rbac.fetchRBAC = jest.fn(() => (Promise.resolve({
    canReadAll: true,
    canWriteAll: true
})));

module.exports = rbac;
