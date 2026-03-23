interface Props {
  bio: string;
}

const ProfileAbout: React.FC<Props> = ({ bio }) => {
  return (
    <div className="bg-[#fafafa] p-5">
      <h3 className="font-bold text-black text-2xl mb-3">About</h3>
      <p className="text-md text-black leading-relaxed">{bio}</p>
    </div>
  );
};

export default ProfileAbout;